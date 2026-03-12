# Booster 2025-Q1

Repositório do sistema **AI Car** desenvolvido durante o Booster 2025-Q1 da Pitang.

O projeto é composto por um backend em NestJS e um frontend em React, com banco de dados PostgreSQL (local via Docker ou remoto via Supabase).

---

## Estrutura do repositório

```
booster-2025-Q1/
├── backend-booster/    # API REST (NestJS + TypeORM + PostgreSQL)
├── frontend-booster/   # SPA (React + TypeScript + Vite + Tailwind)
└── DEPLOYMENT_GUIDE.md # Guia de deploy em produção
```

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose (para banco local)

---

## Setup local

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd booster-2025-Q1
```

### 2. Subir o banco de dados (PostgreSQL local)

```bash
cd backend-booster/docker
docker-compose up -d
```

Isso sobe:
- **PostgreSQL** na porta `5432` (user: `root`, password: `root`, db: `booster_db`)
- **pgAdmin** em `http://localhost:5050` (email: `adming@admin.com`, password: `root`)

### 3. Configurar variáveis de ambiente do backend

Crie o arquivo `backend-booster/.env` com o seguinte conteúdo:

```env
# Banco de dados local (Docker)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=root
POSTGRES_PASSWORD=root
POSTGRES_DB=booster_db

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# URL do frontend (para CORS)
FRONTEND_URL=http://localhost:5173

# Ambiente
NODE_ENV=development
PORT=3000
```

> Para usar o Supabase no lugar do banco local, consulte o `DEPLOYMENT_GUIDE.md`.

### 4. Instalar dependências e rodar as migrations

```bash
cd backend-booster
npm install
npm run migration:run
```

### 5. Configurar variáveis de ambiente do frontend

Crie o arquivo `frontend-booster/.env` com:

```env
VITE_API_URL=http://localhost:3000
```

### 6. Instalar dependências do frontend

```bash
cd frontend-booster
npm install
```

### 7. Rodar o projeto

Em terminais separados:

```bash
# Terminal 1 - Backend
cd backend-booster
npm run start:dev
# API disponível em: http://localhost:3000
# Swagger em: http://localhost:3000/api

# Terminal 2 - Frontend
cd frontend-booster
npm run dev
# App disponível em: http://localhost:5173
```

---

## Controle de acesso

O sistema possui dois perfis de usuário:

| Role | Acesso |
|------|--------|
| `CLIENT` | Catálogo, carrinho, pedidos próprios, agendamentos, chat |
| `ADMIN` | Tudo acima + dashboard, gestão de usuários, todos os pedidos, estoque |

A autenticação é feita via JWT (Bearer Token). O token é retornado no login/registro e deve ser enviado no header `Authorization: Bearer <token>`.

---

## Scripts úteis

### Backend

```bash
npm run start:dev        # Modo desenvolvimento (hot reload)
npm run build            # Build de produção
npm run start:prod       # Rodar build de produção
npm run migration:run    # Aplicar migrations pendentes
npm run migration:revert # Reverter última migration
npm run migration:show   # Listar status das migrations
npm run test             # Rodar testes unitários
npm run test:cov         # Testes com cobertura
```

### Frontend

```bash
npm run dev     # Modo desenvolvimento
npm run build   # Build de produção
npm run preview # Preview do build
```

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS 11, TypeORM, PostgreSQL |
| Autenticação | JWT + Argon2 |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Componentes UI | Radix UI, shadcn/ui |
| Deploy backend | Google Cloud Run |
| Deploy frontend | Firebase Hosting |
| Banco produção | Supabase |

---

## Deploy em produção

Consulte o [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para instruções completas de deploy no Cloud Run e Firebase Hosting.
