# RAG Implementation — AI Car Assistant

## Context
The AI chat assistant currently generates responses from a static system prompt with no knowledge of the actual products and services in the database. This means it cannot answer accurately when users ask "quais filtros vocês têm?" or "quanto custa a revisão?". RAG (Retrieval-Augmented Generation) solves this by embedding the store's catalog at startup and injecting relevant items as context into each Gemini prompt.

**Base to index:** Products + Services only. Users = PII (skip). No FAQ content exists yet.

## Architecture

```

User message
  → RagService.retrieveContext()    [embed query → cosine search → format]
  → GenkitService.runAutomotiveChatFlow(message, context?)
      → prompt = [CONTEXTO]\n{context}\n[FIM]\nPergunta: {message}
      → ai.generate()
```

## Files to Create/Modify

### NEW: `src/core/database/migrations/1770200000000-EnablePgvectorAndRagDocuments.ts`
- `CREATE EXTENSION IF NOT EXISTS vector`
- Create `rag_document` table:
  - `id UUID PK`, `source_type VARCHAR(20)`, `source_id INT`
  - `content_text TEXT`, `embedding vector(768)`, `metadata JSONB`
  - `indexed_at TIMESTAMP`, `UNIQUE(source_type, source_id)`
- `CREATE INDEX IF NOT EXISTS idx_rag_document_embedding USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`
- `down()`: `DROP TABLE IF EXISTS rag_document CASCADE` (do NOT drop extension)

### NEW: `src/api/ai/rag.service.ts`
- `onModuleInit()`: if `COUNT(*) = 0` → call `indexAll()` (wrapped in try/catch, never blocks startup)
- `retrieveContext(message)`: embed query → similarity search → formatContext → return string | undefined
- `indexProdutos()`: fetch with `relations: ['categoria','fabricante']` → `buildProdutoText()` → `embed()` → `upsertDocument()`
- `indexServicos()`: fetch with `where: {ativo:true}, relations:['tipo_servico']` → `buildServicoText()` → `embed()` → `upsertDocument()`
- Text formats:
  - Produto: `"Produto: {nome}\nCategoria: {cat}\nFabricante: {fab}\nDescrição: {desc}\nPreço: R$ {preco}"`
  - Serviço: `"Serviço: {nome}\nTipo: {tipo}\nDescrição: {desc}\nDuração estimada: {dur} minutos\nPreço: R$ {preco}"`
- `upsertDocument()`: raw SQL `INSERT ... ON CONFLICT (source_type, source_id) DO UPDATE SET ...` — passes embedding as `$4::vector` with literal `[f1,f2,...]`
- `similaritySearch()`: raw SQL `WHERE 1-(embedding<=>$1::vector) > $2 ORDER BY embedding<=>$1::vector LIMIT $3` — threshold=0.65, top_k=5
- `formatContext()`: format each doc from `metadata` JSONB, max 3000 chars total
- Injections: `@InjectDataSource() DataSource`, `@InjectRepository(Produto)`, `@InjectRepository(Servico)`, `GenkitService`
- Constants: `RAG_SIMILARITY_THRESHOLD = 0.65`, `RAG_TOP_K = 5`, `MAX_CONTEXT_CHARS = 3000`

### MODIFY: `src/api/ai/genkit.service.ts`
- Add `embedText(text: string): Promise<number[]>`:
  ```ts
  const response = await this.ai.embed({ embedder: 'googleai/text-embedding-004', content: text });
  return response.embeddings[0].values; // 768 dimensions
  ```
- Modify `runAutomotiveChatFlow(userMessage, context?: string)`:
  ```ts
  const prompt = context
    ? `[CONTEXTO DA LOJA - use apenas para informar sua resposta]\n${context}\n[FIM DO CONTEXTO]\n\nPergunta do cliente: ${userMessage}`
    : userMessage;
  ```

### MODIFY: `src/api/ai/ai.module.ts`
- Add to `TypeOrmModule.forFeature([..., Produto, Servico])`
- Add `RagService` to `providers`
- Import entity classes: `Produto` from `../catalog/produto/entities/produto.entity`, `Servico` from `../servicos/entities/servico.entity`

### MODIFY: `src/api/ai/ai.service.ts`
- Inject `RagService` in constructor
- Before calling Genkit: `const ragContext = await this.ragService.retrieveContext(message);`
- Pass to Genkit: `this.genkitService.runAutomotiveChatFlow(message, ragContext)`

## Execution Order
1. Create migration → run `npm run migration:run`
2. Add `embedText()` to `GenkitService`
3. Create `RagService`
4. Modify `AiModule`
5. Modify `AiService`

## Key Design Decisions
- **No circular deps**: entities imported directly in `AiModule.forFeature`, no module-level cross-imports
- **Startup safety**: `onModuleInit` never throws; RAG failure = graceful degradation (AI works without context)
- **Idempotent indexing**: `ON CONFLICT DO UPDATE` — safe to re-run
- **Sequential embedding loop**: avoids rate-limit on Gemini Embedding API
- **Raw SQL for vectors**: TypeORM has no native pgvector support; all vector ops via `DataSource.query()`

## Verification
1. Run migration: `npm run migration:run` — check `rag_document` table created
2. Start backend: check logs for `"Indexando X produtos..."` and `"Indexação RAG concluída."`
3. Ask in widget: "quais filtros vocês têm?" — response should mention actual products from catalog
4. Ask: "quanto custa a revisão preventiva?" — response should cite the actual price from the DB
5. Ask off-topic: "qual o resultado do jogo de futebol?" — should deflect (no RAG context injected)
