import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Produto } from '../catalog/produto/entities/produto.entity';
import { Servico } from '../servicos/entities/servico.entity';
import { GenkitService } from './genkit.service';

const RAG_SIMILARITY_THRESHOLD = 0.65;
const RAG_TOP_K = 10;
const MAX_CONTEXT_CHARS = 3000;
const CACHE_TTL_MS = 60_000;

const SENSITIVE_FIELDS = ['id_produto', 'id_servico', 'margem', 'estoque', 'cpf', 'cnpj'];

interface RagDocument {
  source_type: string;
  source_id: number;
  content_text: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private readonly cache = new Map<string, { value: string | undefined; expiresAt: number }>();

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(Servico)
    private readonly servicoRepository: Repository<Servico>,
    private readonly genkitService: GenkitService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const [{ count }] = await this.dataSource.query<[{ count: string }]>(
        `SELECT COUNT(*)::int AS count FROM rag_document`,
      );
      if (Number(count) === 0) {
        await this.indexAll();
      } else {
        this.logger.log(`RAG: ${count} documentos já indexados.`);
      }
    } catch (err) {
      this.logger.error('Falha na inicialização do RAG (não-crítico):', err);
    }
  }

  async indexAll(): Promise<void> {
    await this.indexProdutos();
    await this.indexServicos();
    this.logger.log('Indexação RAG concluída.');
  }

  private async indexProdutos(): Promise<void> {
    const produtos = await this.produtoRepository.find({
      relations: ['categoria', 'fabricante'],
    });
    this.logger.log(`Indexando ${produtos.length} produtos...`);

    for (const p of produtos) {
      const text = this.buildProdutoText(p);
      const embedding = await this.genkitService.embedText(text);
      await this.upsertDocument({
        source_type: 'produto',
        source_id: p.id_produto,
        content_text: text,
        metadata: {
          nome: p.nome,
          categoria: p.categoria?.nome ?? null,
          fabricante: p.fabricante?.nome ?? null,
          preco: p.preco_unitario,
        },
      }, embedding);
    }
  }

  private async indexServicos(): Promise<void> {
    const servicos = await this.servicoRepository.find({
      where: { ativo: true },
      relations: ['tipo_servico'],
    });
    this.logger.log(`Indexando ${servicos.length} serviços...`);

    for (const s of servicos) {
      const text = this.buildServicoText(s);
      const embedding = await this.genkitService.embedText(text);
      await this.upsertDocument({
        source_type: 'servico',
        source_id: s.id_servico,
        content_text: text,
        metadata: {
          nome: s.nome,
          tipo: s.tipo_servico?.nome ?? null,
          preco: s.preco,
          duracao_estimada: s.duracao_estimada,
        },
      }, embedding);
    }
  }

  private buildProdutoText(p: Produto): string {
    const cat = (p.categoria as { nome?: string })?.nome ?? '';
    const fab = (p.fabricante as { nome?: string })?.nome ?? '';
    return [
      `Produto: ${p.nome}`,
      `Categoria: ${cat}`,
      `Fabricante: ${fab}`,
      `Descrição: ${p.descricao ?? ''}`,
      `Preço: R$ ${p.preco_unitario}`,
    ].join('\n');
  }

  private buildServicoText(s: Servico): string {
    const tipo = (s.tipo_servico as { nome?: string })?.nome ?? '';
    return [
      `Serviço: ${s.nome}`,
      `Tipo: ${tipo}`,
      `Descrição: ${s.descricao ?? ''}`,
      `Duração estimada: ${s.duracao_estimada} minutos`,
      `Preço: R$ ${s.preco}`,
    ].join('\n');
  }

  private async upsertDocument(doc: RagDocument, embedding: number[]): Promise<void> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    await this.dataSource.query(
      `INSERT INTO rag_document (source_type, source_id, content_text, embedding, metadata, indexed_at)
       VALUES ($1, $2, $3, $4::vector, $5, NOW())
       ON CONFLICT (source_type, source_id) DO UPDATE SET
         content_text = EXCLUDED.content_text,
         embedding    = EXCLUDED.embedding,
         metadata     = EXCLUDED.metadata,
         indexed_at   = NOW()`,
      [doc.source_type, doc.source_id, doc.content_text, vectorLiteral, doc.metadata],
    );
  }

  async retrieveContext(message: string, intent?: string): Promise<string | undefined> {
    const cacheKey = `${message}:${intent ?? 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) return cached.value;

    try {
      const embedding = await this.genkitService.embedText(message);
      const sourceType = this.intentToSourceType(intent);
      const docs = await this.similaritySearch(embedding, sourceType);
      const result = docs.length === 0 ? undefined : this.formatContext(docs);
      this.cache.set(cacheKey, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    } catch (err) {
      this.logger.error('Falha ao recuperar contexto RAG (não-crítico):', err);
      return undefined;
    }
  }

  private intentToSourceType(intent?: string): string | undefined {
    if (intent === 'product_recommendation') return 'produto';
    if (intent === 'service_inquiry') return 'servico';
    return undefined;
  }

  private async similaritySearch(embedding: number[], sourceType?: string): Promise<{ content_text: string; metadata: Record<string, unknown> }[]> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    const params: unknown[] = [vectorLiteral, RAG_SIMILARITY_THRESHOLD, RAG_TOP_K];
    const sourceFilter = sourceType ? `AND source_type = $4` : '';
    if (sourceType) params.push(sourceType);

    return this.dataSource.query(
      `SELECT content_text, metadata
       FROM rag_document
       WHERE 1 - (embedding <=> $1::vector) > $2
       ${sourceFilter}
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      params,
    );
  }

  private sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(metadata).filter(([key]) => !SENSITIVE_FIELDS.includes(key)),
    );
  }

  private formatContext(docs: { content_text: string; metadata: Record<string, unknown> }[]): string {
    let result = '';
    for (const doc of docs) {
      const safeMeta = this.sanitizeMetadata(doc.metadata);
      const metaNote = safeMeta.nome ? `(${safeMeta.nome})` : '';
      const block = `${doc.content_text} ${metaNote}\n\n`;
      if ((result + block).length > MAX_CONTEXT_CHARS) break;
      result += block;
    }
    return result.trim();
  }
}
