# Roadmap de Ciclos - Booster 2025

Este documento organiza a evolucao do projeto em ciclos de entrega. A regra operacional e: cada ciclo deve gerar codigo, documentacao e, quando aplicavel, metricas antes/depois.

---

# CICLO 1 - Organizacao e Governanca

## PASSO 1 - Diagnostico Estrutural

Status: Feito.

| Pergunta | Estado |
|---|---|
| O projeto tem arquitetura clara? | Parcialmente. Backend e frontend estao separados, mas ainda ha scripts SQL antigos e referencias historicas que podem confundir. |
| Existe separacao de responsabilidades? | Sim no backend NestJS, com modulos por dominio. Ainda ha oportunidade de padronizar docs e contratos. |
| Existe controle de acesso consistente? | Parcial. Ha JWT, roles e guards, mas o RBAC ainda precisa ser consolidado como politica central. |
| Existe documentacao minima? | Sim, mas estava defasada. `ciclos.md` e o schema Supabase foram atualizados para refletir o estado atual. |
| O board reflete a realidade? | Precisa ser conferido manualmente com o board do projeto. |

## PASSO 2 - Primeira Entrega do Ciclo

Melhoria estrutural escolhida:

```text
Centralizar a governanca do banco Supabase e documentar o fluxo real de deploy.
```

Entregas:

- Criar schema manual oficial para Supabase.
- Remover dependencia de TypeORM migrations no CI/CD.
- Documentar que o deploy do backend nao aplica alteracoes no banco.
- Manter SQLs antigos como referencia historica, nao como fonte principal.

Arquivos principais:

```text
backend-booster/sql/supabase-schema-current.sql
.github/workflows/deploy-backend.yml
ciclos.md
```

Criterios de aceite:

- Cloud Run sobe sem tentar executar migrations.
- Supabase pode ser recriado manualmente a partir de `supabase-schema-current.sql`.
- O time sabe quais SQLs nao usar como schema principal.

---

# CICLO 2 - Inteligencia Artificial

Status geral: Em andamento, com Etapa 1 implementada e Etapa 2 parcialmente implementada.

## Etapa 1 - Implementar Genkit

Status: Implementado.

| Entrega | Estado |
|---|---|
| Criar fluxo controlado | Implementado em `GenkitService` |
| Logar interacoes | Implementado em `AiLogService` e `ai_interaction_log` |
| Separar system prompt de user prompt | Implementado em `system-prompt.config.ts` |
| Criar camada de protecao | Implementado com pipe de sanitizacao, guard de throttle e fallback seguro |

## Etapa 2 - Implementar RAG

Status: Parcialmente implementado.

| Pergunta | Resposta atual |
|---|---|
| Qual base faz sentido usar? | Produtos e servicos. |
| Usuarios entram no RAG? | Nao por enquanto, para evitar risco de privacidade. |
| Conteudo institucional entra no RAG? | Pode entrar depois, se houver base documentada. |

| Entrega | Estado |
|---|---|
| Indexacao | Parcial em `RagService` |
| Busca vetorial | Parcial com `rag_document` e pgvector |
| Context injection controlado | Implementado em `GenkitService`, com limite de contexto no RAG |

Proximos ajustes:

- Criar comando/endpoint administrativo para reindexar RAG.
- Garantir que embeddings sejam gerados somente quando `GOOGLE_GENAI_API_KEY` existir.
- Documentar rotina manual para recriar `rag_document`.

## Etapa 3 - Seguranca de Prompt

Status: Parcialmente implementado.

| Entrega | Estado |
|---|---|
| Sanitizacao | Implementado em `SanitizeInputPipe` |
| Delimitacao de instrucoes | Parcial no prompt e no fluxo Genkit |
| Filtro de palavras sensiveis | Parcial via blocklist anti-injection |
| Limite de contexto | Implementado no RAG com `MAX_CONTEXT_CHARS` |

Proximos ajustes:

- Expandir filtros para dados sensiveis automotivos e pessoais.
- Adicionar testes unitarios para prompt injection.
- Criar lista de termos sensiveis revisavel.

---

# CICLO 3 - Performance e Observabilidade

## PASSO 1 - Medir Antes

| Metrica | Como medir | Status |
|---|---|---|
| Tempo de resposta API | Logs/cliente HTTP/Cloud Run | Pendente |
| Query mais lenta | TypeORM slow query log ou Supabase Query Performance | Pendente |
| Tamanho medio de payload | DevTools/Network ou logs de gateway | Pendente |
| Lighthouse frontend | Lighthouse no ambiente publicado | Pendente |

Baseline a documentar:

```text
ANTES:
- API media: TBD ms
- Query mais lenta: TBD ms
- Payload medio: TBD KB
- Lighthouse Performance: TBD
```

## PASSO 2 - Melhorias

### Backend

- Indexacao.
- `EXPLAIN` nas queries mais lentas.
- Paginacao cursor-based.
- Rate limit.
- Redis/Upstash para cache.

| Item | Estado |
|---|---|
| Indexacao | Parcial no schema Supabase atual |
| Query profiler | Existe `QueryProfilerService` |
| Paginacao cursor-based | Ha estrutura compartilhada, precisa validar uso real |
| Rate limit | Implementado para IA, falta padronizar por dominio |
| Redis/Upstash | Cache foi tornado opcional; integracao Upstash pendente |

### Frontend

- Memoizacao.
- Lazy loading.
- Evitar re-render desnecessario.
- Skeleton loading.

Status: Pendente de diagnostico no frontend.

## PASSO 3 - Medir Depois

Formato esperado:

```text
ANTES: 480ms
DEPOIS: 120ms
GANHO: 75%
```

---

# CICLO 4 - Seguranca e Escalabilidade

Status: Planejado.

| Entrega | Prioridade | Observacao |
|---|---|---|
| RBAC real backend first | Alta | Centralizar regras por role/permissao |
| Protecao XSS | Alta | Frontend e sanitizacao de saida |
| CSRF | Media | Avaliar conforme uso de cookies/sessao |
| CSP | Alta | Headers no frontend/hosting |
| Recaptcha | Media | Aplicar em rotas publicas sensiveis |
| Configuracao Cloudflare | Media | DNS, WAF, cache e headers |
| Limite de retorno de dados | Alta | Evitar endpoints sem paginacao/limite |

Proposta de primeira entrega do Ciclo 4:

```text
RBAC real no backend, com matriz de permissoes e guards padronizados.
```

Criterios de aceite:

- Matriz de roles documentada.
- Guards aplicados nas rotas administrativas.
- Testes cobrindo acesso permitido e negado.
- Endpoints sensiveis com limite de retorno.

---

---

# CICLO 2 - Etapa 1: IA conversacional automotiva

## Status

| Item | Estado |
|---|---|
| Objetivo | Adicionar IA conversacional automotiva ao backend NestJS |
| Status geral | Implementado |
| Modelo atual | Gemini 2.5 Flash via Genkit |
| Rotas | `POST /ai/chat`, `GET /ai/logs`, `POST /ai/public/chat` |
| Modulo | `backend-booster/src/api/ai/` |
| Banco | Supabase mantido manualmente via SQL Editor |
| Schema manual | `backend-booster/sql/supabase-schema-current.sql` |
| CI/CD | GitHub Actions faz build/deploy, mas nao executa migrations |

---

## Decisoes Atuais

- O Supabase nao executa TypeORM migrations no deploy.
- O schema do banco deve ser aplicado manualmente usando `backend-booster/sql/supabase-schema-current.sql`.
- As migrations TypeORM antigas ficam apenas como referencia historica enquanto o fluxo manual estiver em uso.
- O backend usa `DATABASE_URL` apenas para conexao em runtime.
- O deploy do backend no Cloud Run nao deve bloquear por alteracao de banco.

---

## Modulo de IA Implementado

```text
backend-booster/src/api/ai/
  ai.module.ts
  ai.controller.ts
  ai-public.controller.ts
  ai.service.ts
  genkit.service.ts
  rag.service.ts
  ai-log.service.ts
  config/
    system-prompt.config.ts
  dto/
    chat-request.dto.ts
    chat-response.dto.ts
  entities/
    ai-interaction-log.entity.ts
  guards/
    ai-throttle.guard.ts
  pipes/
    sanitize-input.pipe.ts
```

---

## Rotas

### `POST /ai/chat`

Rota autenticada para chat com o assistente automotivo.

Protecoes:

- `JwtAuthGuard`
- `AiThrottleGuard`
- `SanitizeInputPipe`
- Limite atual: 20 requisicoes por minuto

Entrada:

```json
{
  "message": "Preciso trocar o oleo do carro",
  "sessionId": "opcional"
}
```

Saida:

```json
{
  "response": "Resposta do assistente",
  "intentDetected": "service_inquiry",
  "suggestedProductIds": [],
  "suggestedServiceIds": []
}
```

### `POST /ai/public/chat`

Rota publica sem autenticacao.

Uso esperado:

- Atendimento inicial
- Perguntas gerais
- Chat publico sem acesso a dados pessoais

Protecoes:

- `AiThrottleGuard`
- `SanitizeInputPipe`
- Limite atual: 10 requisicoes por minuto

### `GET /ai/logs`

Rota administrativa para consultar logs de interacoes.

Protecoes:

- `JwtAuthGuard`
- `RolesGuard`
- `ADMIN`

---

## Fluxo Atual

```text
Cliente
  -> POST /ai/chat ou /ai/public/chat
    -> SanitizeInputPipe
    -> AiThrottleGuard
    -> AiService.chat()
      -> detectIntent()
      -> RagService.retrieveContext()
      -> GenkitService.runAutomotiveChatFlow()
      -> AiLogService.persist().catch()
      -> ChatResponseDto
```

Caracteristicas importantes:

- Log de IA e fire-and-forget.
- Falha ao persistir log nao quebra a resposta ao usuario.
- RAG e usado para enriquecer contexto quando possivel.
- Se a chave `GOOGLE_GENAI_API_KEY` nao existir, o sistema retorna fallback seguro.

---

## Prompt

Arquivo:

```text
backend-booster/src/api/ai/config/system-prompt.config.ts
```

Decisao:

- Prompt versionado no Git.
- Nao fica no banco.
- Nao fica em `.env`.
- `SYSTEM_PROMPT_VERSION` e gravado nos logs.

---

## Banco de Dados

Tabela principal de log:

```text
ai_interaction_log
```

Colunas relevantes:

| Coluna | Descricao |
|---|---|
| `id` | UUID |
| `user_id` | FK nullable para `usuario(id_usuario)` |
| `session_id` | Agrupamento de conversa |
| `prompt_text` | Mensagem sanitizada |
| `system_prompt_version` | Versao do prompt |
| `response_text` | Resposta gerada |
| `intent_detected` | Intent detectada |
| `input_tokens` | Tokens de entrada |
| `output_tokens` | Tokens de saida |
| `total_tokens` | Total calculado |
| `model_used` | Modelo usado |
| `latency_ms` | Latencia total |
| `was_filtered` | Indicador de fallback/filtro |
| `created_at` | Data de criacao |

Schema manual atual:

```text
backend-booster/sql/supabase-schema-current.sql
```

Esse arquivo deve ser usado como fonte para recriar o banco no Supabase.

Nao usar como schema principal:

```text
booster_schema_supabase.sql
user_table_supabase.sql
backend-booster/sql/create-pedido-tables.sql
backend-booster/sql/create-cart-tables.sql
```

Motivo:

- Esses arquivos representam versoes antigas ou parciais do schema.
- Alguns usam `cliente`, `"user"`, `pedido.id_usuario` ou `estoque`.
- O backend atual espera `usuario`, `pedido.id_cliente` e nao possui entity de `estoque`.

---

## Protecoes Implementadas

### Sanitizacao

Arquivo:

```text
backend-booster/src/api/ai/pipes/sanitize-input.pipe.ts
```

Regras:

- Mensagem deve ser string.
- Remove espacos no inicio/fim.
- Bloqueia mensagem vazia.
- Maximo de 2000 caracteres.
- Remove tags HTML.
- Bloqueia padroes comuns de prompt injection.

### Rate limit

Arquivo:

```text
backend-booster/src/api/ai/guards/ai-throttle.guard.ts
```

Comportamento:

- Usuario autenticado: rate limit por `req.user.id`.
- Usuario publico: fallback por IP.

---

## Pontos Que Mudaram Em Relacao Ao Plano Original

| Plano original | Estado atual |
|---|---|
| Gemini 2.0 Flash | Codigo usa Gemini 2.5 Flash |
| Apenas `POST /ai/chat` | Tambem existe `POST /ai/public/chat` |
| Migrations TypeORM no fluxo | Supabase e mantido manualmente |
| Sem RAG nesta etapa | RAG ja existe com `rag_document` e pgvector |
| Log apenas autenticado | Chat publico tambem pode gerar log com `userId = null` |

---

## Checklist Operacional

Para recriar o banco:

1. Rodar drop geral apenas se puder apagar os dados.
2. Rodar `backend-booster/sql/supabase-schema-current.sql`.
3. Se usar RAG, garantir extensao `vector` habilitada no Supabase.
4. Rodar seed manual, sem blocos antigos que dependam de `estoque`.
5. Conferir se as tabelas `usuario`, `produto`, `servico`, `pedido` e `ai_interaction_log` existem.

Para deploy:

1. GitHub Actions nao roda migrations.
2. Docker build compila o backend.
3. Cloud Run recebe `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` e `GOOGLE_GENAI_API_KEY`.
4. Testar `/health`.
5. Testar `/api`.
6. Testar `/ai/public/chat`.

---

## Proximos Passos Sugeridos

1. Concluido: criar um seed manual atualizado, sem dependencia de `estoque`.
2. Concluido: criar testes para `SanitizeInputPipe`.
3. Concluido: criar teste de contrato para `POST /ai/public/chat`.
4. Concluido: documentar no README que o schema oficial do Supabase e `backend-booster/sql/supabase-schema-current.sql`.
5. Decisao: manter migrations TypeORM antigas como referencia historica e remover em uma limpeza separada, sem misturar com deploy ou schema manual do Supabase.
