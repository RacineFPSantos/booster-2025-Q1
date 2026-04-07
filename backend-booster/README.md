# Booster — Backend

API REST construída com NestJS + TypeORM + PostgreSQL.

## Requisitos

- Node.js 20+
- Docker e Docker Compose

## Banco de dados

O banco roda via Docker. A imagem utilizada é **`pgvector/pgvector:pg17`** (PostgreSQL 17 com a extensão `pgvector` pré-instalada), necessária para o módulo de IA com RAG.

> **Atenção:** não use `postgres:17` puro — a extensão `vector` não está disponível nessa imagem.

```bash
# Subir o banco e o pgAdmin
docker compose -f docker/docker-compose.yml up -d
```

| Serviço  | URL                    | Credenciais             |
|----------|------------------------|-------------------------|
| Postgres | `localhost:5432`       | root / root / booster_db |
| pgAdmin  | http://localhost:5050  | adming@admin.com / root |

## Instalação

```bash
npm install
```

## Migrations

```bash
# Rodar todas as migrations pendentes
npm run migration:run

# Criar nova migration
npm run migration:create --name=NomeDaMigration

# Reverter última migration
npm run migration:revert
```

## Executar

```bash
# desenvolvimento (watch)
npm run start:dev

# produção
npm run start:prod
```

## Módulo de IA (RAG)

O assistente de chat usa **Gemini 2.5 Flash** via Genkit com RAG (Retrieval-Augmented Generation):

- Na inicialização, produtos e serviços do catálogo são indexados como embeddings (`text-embedding-004`, 768 dimensões) na tabela `rag_document`.
- A cada mensagem do usuário, os documentos mais similares são recuperados (threshold 0.65, top 5) e injetados como contexto no prompt.
- Degradação graciosa: se o RAG falhar, o chat continua funcionando sem contexto.

A variável de ambiente necessária:

```env
GOOGLE_GENAI_API_KEY=sua_chave_aqui
```

## Testes

```bash
npm run test
npm run test:e2e
npm run test:cov
```
