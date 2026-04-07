CICLO 2 – Etapa 1: Integrar Genkit

---

## Visão Geral

| | |
|---|---|
| **Objetivo** | Adicionar IA conversacional automotiva ao backend NestJS |
| **Modelo** | Gemini 2.0 Flash via Google Genkit 1.x |
| **Nova rota** | `POST /ai/chat` (autenticada, com rate limit) |
| **Novo módulo** | `src/api/ai/` — isolado, sem contaminar outros módulos |

---

## Pacotes a instalar

```bash
npm install genkit @genkit-ai/googleai @nestjs/throttler
```

Nova variável de ambiente:
```
GOOGLE_GENAI_API_KEY=sua_chave_aqui
```

---

## Estrutura do novo módulo

```
src/api/ai/
  ai.module.ts                        ← wiring NestJS
  ai.controller.ts                    ← POST /ai/chat, GET /ai/logs
  ai.service.ts                       ← orquestrador (chama Genkit + log)
  genkit.service.ts                   ← adapter Genkit/Gemini + flow
  ai-log.service.ts                   ← persistência TypeORM
  config/
    system-prompt.config.ts           ← prompt versionado (código, não DB)
  dto/
    chat-request.dto.ts
    chat-response.dto.ts
  entities/
    ai-interaction-log.entity.ts      ← tabela ai_interaction_log
  guards/
    ai-throttle.guard.ts              ← rate limit por userId (não por IP)
  pipes/
    sanitize-input.pipe.ts            ← sanitização + anti-injection
```

**Arquivos existentes a modificar (apenas 2):**
- `src/app.module.ts` → adicionar `ThrottlerModule` + `AiModule`
- `.env` → adicionar `GOOGLE_GENAI_API_KEY`

---

## Deliverable 1 — Fluxo controlado (GenkitService)

```
Input (Zod)          Flow Genkit           Output (Zod)
──────────────  →  ─────────────────  →   ─────────────────────
userMessage          system prompt         responseText
conversationHistory  + histórico           intentDetected
                     + user message        suggestedProductIds[]
                                           suggestedServiceIds[]
                                           inputTokens / outputTokens
```

- `ai.defineFlow` com schemas Zod (input + output tipados)
- `intentDetected` enum: `product_recommendation | service_inquiry | scheduling_help | price_question | general_question | off_topic`
- System prompt injetado como primeira mensagem `role: 'system'`

---

## Deliverable 2 — Log de interações

Nova tabela `ai_interaction_log`:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid PK | |
| `user_id` | int FK nullable | → `usuario(id_usuario)` ON DELETE SET NULL |
| `session_id` | varchar nullable | Agrupa turnos de conversa |
| `prompt_text` | text | Mensagem sanitizada enviada ao modelo |
| `system_prompt_version` | varchar | Versão do prompt usado (ex: `"1.0.0"`) |
| `response_text` | text | Resposta bruta do modelo |
| `intent_detected` | varchar nullable | |
| `input_tokens` | int nullable | |
| `output_tokens` | int nullable | |
| `model_used` | varchar | `"gemini-2.0-flash"` |
| `latency_ms` | int | Tempo total da chamada |
| `was_filtered` | boolean | Se o filtro de conteúdo atuou |
| `created_at` | timestamp | `@CreateDateColumn()` |

**Regra crítica:** log é fire-and-forget com `.catch()` — falha de escrita no log **nunca** propaga erro para o usuário.

---

## Deliverable 3 — Separação system prompt / user prompt

```ts
// config/system-prompt.config.ts
export const SYSTEM_PROMPT_VERSION = '1.0.0';

export const SYSTEM_PROMPT = `
  Você é o assistente virtual da AI Car, loja especializada em peças e 
  serviços automotivos. Responda em português brasileiro...
  [persona, tom, domínio, limitações]
`;
```

**Decisão arquitetural:** prompt em TypeScript versionado no git, não no banco nem no `.env`.
- Cada mudança de prompt é um commit revisável em PR
- `SYSTEM_PROMPT_VERSION` é persistido em cada log para correlacionar qual prompt gerou qual resposta
- `AiService` não conhece o prompt — só `GenkitService` acessa

---

## Deliverable 4 — Camada de proteção

**Rate limiting** (`AiThrottleGuard`):
- 20 requisições / minuto por `userId` (não por IP — backend fica atrás de proxy)
- Herda `ThrottlerGuard`, sobrescreve `getTracker` para usar `req.user.id`

**Sanitização** (`SanitizeInputPipe`):
- Trim whitespace
- Máximo 2000 caracteres (`BadRequestException` se exceder)
- Strip HTML tags (`/<[^>]*>/g`)
- Blocklist anti-prompt-injection: `"ignore previous instructions"`, `"you are now"`, `"new persona"`, etc. (case-insensitive)

**Filtro pós-resposta** (dentro do `GenkitService`):
- `finishReason === "SAFETY"` → resposta fallback segura + `was_filtered = true`
- `intentDetected === "off_topic"` → deflexão educada em pt-BR + `was_filtered = true`
- Resposta > 4000 chars → truncada

---

## Fluxo de dados completo

```
Browser
  └─ POST /ai/chat { message, sessionId? }
       │
       ├─ JwtAuthGuard (req.user.id)
       ├─ AiThrottleGuard (20 req/min por userId)
       ├─ SanitizeInputPipe (trim, max 2000, strip HTML, blocklist)
       │
       └─ AiController.chat()
            └─ AiService.chat(userId, message, sessionId)
                 ├─ GenkitService.runAutomotiveChatFlow(message)
                 │    ├─ system prompt (v1.0.0) + histórico + user message
                 │    ├─ Gemini 2.0 Flash
                 │    └─ filtro pós-resposta (safety + off_topic)
                 │
                 ├─ AiLogService.persist(...).catch()  ← não bloqueia
                 │
                 └─ ChatResponseDto { response, intentDetected, ... }
```

---

## Ordem de implementação

| # | Entregável | Arquivo principal |
|---|-----------|------------------|
| 1 | Migration + Entity | `1770000000000-CreateAiInteractionLog.ts` |
| 2 | System prompt config | `config/system-prompt.config.ts` |
| 3 | GenkitService (flow) | `genkit.service.ts` |
| 4 | AiLogService | `ai-log.service.ts` |
| 5 | SanitizeInputPipe | `pipes/sanitize-input.pipe.ts` |
| 6 | AiThrottleGuard | `guards/ai-throttle.guard.ts` |
| 7 | DTOs | `dto/chat-request.dto.ts` |
| 8 | AiService (orquestrador) | `ai.service.ts` |
| 9 | AiController | `ai.controller.ts` |
| 10 | AiModule + app.module.ts | `ai.module.ts` |

---

Posso começar a implementar agora seguindo essa ordem, ou prefere ajustar algo no planejamento antes?