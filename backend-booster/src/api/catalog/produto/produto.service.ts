import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './entities/produto.entity';
import {
  CursorPage,
  encodeCursor,
  decodeCursor,
} from '../../../shared/pagination/cursor-page';

interface ProdutoCursor {
  nome: string;
  id_produto: number;
}

const CACHE_TTL_PRODUTO = 60 * 60 * 1000; // 1 hora em ms
const CACHE_KEY_PRODUTO_ALL = 'produto:all';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const produto = this.produtoRepository.create(createProdutoDto);
    const saved = await this.produtoRepository.save(produto);
    await this.cacheManager.del(CACHE_KEY_PRODUTO_ALL);
    return saved;
  }

  async findAll(): Promise<Produto[]> {
    const cached = await this.cacheManager.get<Produto[]>(CACHE_KEY_PRODUTO_ALL);
    if (cached) return cached;

    const produtos = await this.produtoRepository.find({
      relations: ['categoria', 'fabricante'],
      order: { nome: 'ASC' },
    });

    await this.cacheManager.set(CACHE_KEY_PRODUTO_ALL, produtos, CACHE_TTL_PRODUTO);
    return produtos;
  }

  async findAllPaginated(
    limit = 20,
    cursor?: string,
    search?: string,
    id_categoria?: number,
    id_fabricante?: number,
  ): Promise<CursorPage<Produto>> {
    const qb = this.produtoRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.categoria', 'categoria')
      .leftJoinAndSelect('p.fabricante', 'fabricante')
      .orderBy('p.nome', 'ASC')
      .addOrderBy('p.id_produto', 'ASC')
      .take(limit + 1);

    if (cursor) {
      const { nome, id_produto } = decodeCursor<ProdutoCursor>(cursor);
      qb.andWhere(
        '(p.nome > :nome OR (p.nome = :nome AND p.id_produto > :id_produto))',
        { nome, id_produto },
      );
    }

    if (search) {
      qb.andWhere(
        '(LOWER(p.nome) LIKE :search OR LOWER(p.descricao) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (id_categoria) {
      qb.andWhere('p.id_categoria = :id_categoria', { id_categoria });
    }

    if (id_fabricante) {
      qb.andWhere('p.id_fabricante = :id_fabricante', { id_fabricante });
    }

    const countQb = this.produtoRepository.createQueryBuilder('p');

    if (search) {
      countQb.andWhere(
        '(LOWER(p.nome) LIKE :search OR LOWER(p.descricao) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }
    if (id_categoria) {
      countQb.andWhere('p.id_categoria = :id_categoria', { id_categoria });
    }
    if (id_fabricante) {
      countQb.andWhere('p.id_fabricante = :id_fabricante', { id_fabricante });
    }

    const [rows, total] = await Promise.all([qb.getMany(), countQb.getCount()]);
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const last = data[data.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor({ nome: last.nome, id_produto: last.id_produto })
        : null;

    return { data, nextCursor, hasMore, limit, total };
  }

  async findOne(id: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({
      where: { id_produto: id },
      relations: ['categoria', 'fabricante'],
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return produto;
  }

  async update(
    id: number,
    updateProdutoDto: UpdateProdutoDto,
  ): Promise<Produto> {
    const produto = await this.findOne(id);
    Object.assign(produto, updateProdutoDto);
    produto.updated_at = new Date();
    const saved = await this.produtoRepository.save(produto);
    await this.cacheManager.del(CACHE_KEY_PRODUTO_ALL);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const produto = await this.findOne(id);
    await this.produtoRepository.remove(produto);
    await this.cacheManager.del(CACHE_KEY_PRODUTO_ALL);
  }
}
