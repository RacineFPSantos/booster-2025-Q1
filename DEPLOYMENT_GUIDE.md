# 🚀 Guia de Deployment - Booster 2025

## 📋 Visão Geral

- **Backend**: NestJS no Cloud Run (Google Cloud Platform)
- **Frontend**: React + Vite no Firebase Hosting
- **Banco de Dados**: PostgreSQL no Supabase

---

## 🔧 Configuração do Backend (Cloud Run)

### 1. Obter a URL do Cloud Run

Primeiro, faça o deploy do backend no Cloud Run:

```bash
cd backend-booster

# Build da imagem Docker
gcloud builds submit --tag gcr.io/SEU_PROJECT_ID/backend-booster

# Deploy no Cloud Run
gcloud run deploy backend-booster \
  --image gcr.io/SEU_PROJECT_ID/backend-booster \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated
```

Após o deploy, você receberá uma URL como:
```
https://backend-booster-XXXXX-uc.a.run.app
```

### 2. Configurar Variáveis de Ambiente no Cloud Run

No Console do Cloud Run, configure as seguintes variáveis de ambiente:

```env
DATABASE_URL=postgresql://postgres.kwefarwjthmxffmoymty:C1G0syCFuYdJfT@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
JWT_SECRET=seu_secret_super_seguro_aqui_mude_em_producao
JWT_EXPIRES_IN=1d
FRONTEND_URL=https://booster2025-aicar.web.app
PORT=8080
```

**IMPORTANTE**: O Cloud Run usa a porta 8080 por padrão!

### 3. Atualizar CORS no Backend

O arquivo `backend-booster/src/main.ts` já está configurado para aceitar:
- ✅ `http://localhost:5173` (desenvolvimento)
- ✅ `https://booster2025-aicar.web.app` (Firebase Hosting)
- ✅ `https://booster2025-aicar.firebaseapp.com` (Firebase Hosting alternativo)

Se sua URL do Firebase for diferente, atualize o arquivo:

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://SUA-URL.web.app',
  'https://SUA-URL.firebaseapp.com',
].filter(Boolean);
```

---

## 🎨 Configuração do Frontend (Firebase Hosting)

### 1. Atualizar URL da API

Edite o arquivo `frontend-booster/.env.production`:

```env
VITE_API_URL=https://backend-booster-XXXXX-uc.a.run.app
```

**Substitua pela URL real do seu Cloud Run!**

### 2. Build e Deploy

```bash
cd frontend-booster

# Instalar dependências (se necessário)
npm install

# Build de produção (usa .env.production)
npm run build

# Login no Firebase (se necessário)
firebase login

# Deploy no Firebase Hosting
firebase deploy --only hosting
```

### 3. Verificar Deploy

Acesse a URL do Firebase:
```
https://booster2025-aicar.web.app
```

---

## 🔐 URLs e Variáveis de Ambiente

### Backend (Cloud Run)

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DATABASE_URL` | `postgresql://...` | Conexão com Supabase |
| `JWT_SECRET` | `seu_secret_aqui` | Chave secreta JWT |
| `JWT_EXPIRES_IN` | `1d` | Expiração do token |
| `FRONTEND_URL` | `https://booster2025-aicar.web.app` | URL do frontend |
| `PORT` | `8080` | Porta do Cloud Run |

### Frontend (Firebase Hosting)

| Variável | Desenvolvimento | Produção |
|----------|----------------|----------|
| `VITE_API_URL` | `http://localhost:3000` | `https://seu-cloudrun.run.app` |

---

## 🧪 Testando a Conexão

### 1. Teste Local (Dev)

```bash
# Terminal 1 - Backend
cd backend-booster
npm run start:dev

# Terminal 2 - Frontend
cd frontend-booster
npm run dev
```

Acesse: `http://localhost:5173`

### 2. Teste em Produção

1. Acesse: `https://booster2025-aicar.web.app`
2. Abra o DevTools (F12) → Console
3. Tente fazer login ou qualquer requisição
4. Verifique se não há erros de CORS

### 3. Verificar CORS

Se houver erro de CORS, você verá algo como:

```
Access to XMLHttpRequest at 'https://backend-booster-xxx.run.app/auth/login' 
from origin 'https://booster2025-aicar.web.app' has been blocked by CORS policy
```

**Soluções:**
- ✅ Verifique se a `FRONTEND_URL` está configurada corretamente no Cloud Run
- ✅ Verifique se a URL está na lista de `allowedOrigins` no `main.ts`
- ✅ Faça um novo deploy do backend após alterar CORS

---

## 📦 Comandos Úteis

### Backend

```bash
# Desenvolvimento local
npm run start:dev

# Build
npm run build

# Executar migrations
npm run migration:run

# Criar nova migration
npm run migration:create -- src/core/database/migrations/NomeDaMigration
```

### Frontend

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Deploy no Firebase
firebase deploy --only hosting
```

### Cloud Run

```bash
# Ver logs
gcloud run logs read backend-booster --region=southamerica-east1

# Listar serviços
gcloud run services list

# Deletar serviço
gcloud run services delete backend-booster --region=southamerica-east1
```

---

## 🐛 Troubleshooting

### Problema: Erro de CORS

**Sintoma**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solução**:
1. Verifique se a URL do frontend está em `allowedOrigins` no `main.ts`
2. Configure `FRONTEND_URL` no Cloud Run
3. Faça um novo deploy do backend

### Problema: Erro 401 Unauthorized

**Sintoma**: Requisições retornam 401 mesmo com login válido

**Solução**:
1. Verifique se o token JWT está sendo salvo no localStorage
2. Verifique se o interceptor do Axios está funcionando (frontend-booster/src/lib/axios.ts)
3. Verifique se o `JWT_SECRET` é o mesmo no backend

### Problema: Erro de conexão com banco

**Sintoma**: `Error: connect ECONNREFUSED` ou timeout

**Solução**:
1. Verifique se a `DATABASE_URL` está correta no Cloud Run
2. Verifique se o IP do Cloud Run está na whitelist do Supabase
3. Use o pooler do Supabase (porta 6543) para melhor compatibilidade

### Problema: Frontend não encontra a API

**Sintoma**: `Network Error` ou `ERR_CONNECTION_REFUSED`

**Solução**:
1. Verifique se a `VITE_API_URL` está correta no `.env.production`
2. Faça um novo build do frontend: `npm run build`
3. Verifique se o backend está online: acesse `https://sua-url.run.app/api` (Swagger)

---

## ✅ Checklist de Deploy

### Backend (Cloud Run)

- [ ] Build da imagem Docker
- [ ] Deploy no Cloud Run
- [ ] Configurar variáveis de ambiente (DATABASE_URL, JWT_SECRET, FRONTEND_URL)
- [ ] Testar endpoint de health: `https://sua-url.run.app/api`
- [ ] Verificar logs de erros

### Frontend (Firebase Hosting)

- [ ] Atualizar `.env.production` com URL do Cloud Run
- [ ] Build de produção: `npm run build`
- [ ] Deploy no Firebase: `firebase deploy --only hosting`
- [ ] Testar acesso: `https://booster2025-aicar.web.app`
- [ ] Verificar Console do navegador (F12) por erros

### Testes Finais

- [ ] Login funciona
- [ ] Carrinho de compras funciona
- [ ] Listagem de produtos funciona
- [ ] Criação de pedidos funciona
- [ ] Não há erros de CORS no Console

---

## 🔗 URLs Importantes

| Serviço | URL |
|---------|-----|
| Frontend (Firebase) | https://booster2025-aicar.web.app |
| Backend (Cloud Run) | https://seu-servico.run.app |
| API Docs (Swagger) | https://seu-servico.run.app/api |
| Banco de Dados | Supabase Dashboard |
| Firebase Console | https://console.firebase.google.com |
| Cloud Run Console | https://console.cloud.google.com/run |

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Cloud Run: `gcloud run logs read backend-booster`
2. Verifique o Console do navegador (F12)
3. Verifique a configuração de CORS no `main.ts`
4. Verifique as variáveis de ambiente no Cloud Run

---

**Última atualização**: 2025-01-XX
