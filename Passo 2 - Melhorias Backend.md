# Passo 2 — Melhorias de Performance do Backend

Este documento explica cada mudança implementada, por que foi feita, como funciona tecnicamente e qual o impacto esperado no sistema.

---

## Sumário

1. [Indexação do Banco de Dados](#1-indexação-do-banco-de-dados)
2. [EXPLAIN nas Queries — Diagnóstico de Performance](#2-explain-nas-queries--diagnóstico-de-performance)
3. [Paginação Cursor-based](#3-paginação-cursor-based)
4. [Redis — Cache com Docker](#4-redis--cache-com-docker)

---

## 1. Indexação do Banco de Dados

**Arquivo criado:** `src/core/database/migrations/1770300000000-AddPerformanceIndexes.ts`

### O problema que existia

O PostgreSQL, sem indexes, faz o que chamamos de **Sequential Scan (Seq Scan)**: ele lê cada linha da tabela do começo ao fim para encontrar o que você pediu. Isso é como procurar um nome em um livro de 500 páginas sem índice — você tem que ler página por página.

Antes dessa migration, todas as tabelas tinham **apenas a Primary Key (PK) como index**. A PK é criada automaticamente, mas ela só ajuda quando você busca `WHERE id = X`. Em qualquer outra situação — filtros por data, por usuário, por status — o banco fazia Seq Scan.

### Como um index funciona

Um index é uma estrutura de dados separada (geralmente uma B-Tree) que o banco mantém sincronizada com a tabela. Ela organiza os dados por uma coluna específica, como um índice de livro. Quando você faz `WHERE id_cliente = 5`, em vez de ler 50.000 pedidos, o banco vai direto ao index e encontra as posições exatas das linhas.

**Custo:** indexes ocupam espaço em disco e tornam `INSERT`, `UPDATE` e `DELETE` ligeiramente mais lentos, porque o banco precisa atualizar tanto a tabela quanto o index. Em tabelas com muita leitura e pouca escrita (como catálogo de produtos), esse custo é irrelevante comparado ao ganho de leitura.

### Indexes criados e por quê cada um

---

#### `idx_pedido_created_at_status`
```sql
ON pedido(created_at DESC, status)
```

**Onde é usado:** `dashboard.service.ts` — os dois `createQueryBuilder` que calculam o total de vendas do mês.

```sql
-- Exemplo da query que se beneficia
SELECT SUM(valor_total) FROM pedido
WHERE created_at >= '2025-04-01'
AND status != 'CANCELADO'
```

**Por que é composto (duas colunas)?** O banco pode usar um único index para satisfazer tanto o filtro de data (`created_at`) quanto o filtro de status. Sem ele, o banco faria Seq Scan em todos os pedidos para calcular as estatísticas mensais. Com 50.000 pedidos, isso acontece em cada acesso ao dashboard.

**O `DESC` no index:** A ordenação `DESC` no index espelha a ordenação da query (`ORDER BY created_at DESC`). Isso evita que o banco leia o index ao contrário, o que seria mais lento.

---

#### `idx_pedido_id_cliente_created_at`
```sql
ON pedido(id_cliente, created_at DESC)
```

**Onde é usado:** `pedido.service.ts` → `findMyOrders()` e `findMyOrdersPaginated()`.

```sql
SELECT * FROM pedido
WHERE id_cliente = 5
ORDER BY created_at DESC
```

**Por que as duas colunas juntas?** Com o index composto `(id_cliente, created_at DESC)`, o banco faz uma única operação: localiza os pedidos do usuário 5 E os retorna já ordenados por data. Sem esse index, seria necessário primeiro filtrar todos os pedidos do usuário (Seq Scan) e depois ordenar o resultado em memória — duas operações separadas.

---

#### `idx_carrinho_id_usuario`
```sql
ON carrinho(id_usuario)
```

**Onde é usado:** `cart.service.ts` → `findOrCreateCart()` — executado em **toda operação de carrinho** (adicionar item, remover item, ver carrinho, finalizar pedido).

```sql
SELECT * FROM carrinho WHERE id_usuario = 5
```

Esse é um dos indexes mais importantes, porque `findOrCreateCart` é chamado constantemente. Sem ele, cada vez que um usuário acessa o carrinho, o banco lê toda a tabela `carrinho`.

---

#### `idx_produto_categoria_fabricante`
```sql
ON produto(id_categoria, id_fabricante)
```

**Onde é usado:** `produto.service.ts` → `findAll()` e `findAllPaginated()`, que fazem JOIN com `categoria` e `fabricante`.

```sql
SELECT p.*, c.nome, f.nome
FROM produto p
LEFT JOIN categoria c ON c.id_categoria = p.id_categoria
LEFT JOIN fabricante f ON f.id_fabricante = p.id_fabricante
```

**Por que?** Em JOINs, o banco precisa casar as chaves estrangeiras de `produto` com as PKs de `categoria` e `fabricante`. O index nas colunas de FK do lado filho (`produto`) acelera esse casamento.

---

#### `idx_rooms_status_created_at`
```sql
ON rooms(status, created_at DESC)
```

**Onde é usado:** `chat.service.ts` → `getWaitingRooms()`, `getRoomsByFilter()`, `cleanInactiveRooms()`.

```sql
SELECT * FROM rooms
WHERE status IN ('waiting', 'active')
ORDER BY created_at DESC
```

O painel de atendimento do admin usa essa query constantemente. Sem o index, em um ambiente com 2.000+ salas, cada acesso ao painel de chat faz Seq Scan.

---

#### `idx_messages_room_id_created_at`
```sql
ON messages(room_id, created_at DESC)
```

**Onde é usado:** `chat.service.ts` → `getMessagesByRoom()` e `getMessagesByRoomPaginated()`.

```sql
SELECT * FROM messages
WHERE room_id = 'uuid-da-sala'
ORDER BY created_at ASC
```

Mensagens crescem muito rápido. Com 20.000 mensagens e sem index, cada abertura de uma conversa no chat faz Seq Scan em toda a tabela.

---

#### `idx_agendamento_id_usuario_data`
```sql
ON agendamento(id_usuario, data_agendamento)
```

**Onde é usado:** `servicos.service.ts` → `findMyAgendamentos()` — histórico de agendamentos do usuário.

---

#### `idx_agendamento_status_data`
```sql
ON agendamento(status, data_agendamento)
```

**Onde é usado:** Queries que buscam agendamentos do dia por status (PENDENTE, CONFIRMADO, etc.) — útil para a agenda de atendimento.

---

#### `idx_usuario_role`
```sql
ON usuario(usuario_role)
```

**Onde é usado:** `dashboard.service.ts` → `userRepository.count({ where: { usuario_role: 'CLIENT' } })`.

```sql
SELECT COUNT(*) FROM usuario WHERE usuario_role = 'CLIENT'
```

Executado a cada carregamento do dashboard. Sem index, conta todos os usuários fazendo Seq Scan.

---

### Como rodar a migration

```bash
npm run typeorm migration:run
```

### Como reverter

```bash
npm run typeorm migration:revert
```

O método `down()` da migration desfaz todos os indexes com `DROP INDEX IF EXISTS`, sem afetar os dados.

---

### Impacto esperado

| Cenário | Antes | Depois |
|---|---|---|
| Dashboard com 50k pedidos | ~200-500ms por query | ~1-5ms com index |
| Histórico de pedidos do usuário | Seq Scan 50k linhas | Index Scan ~10 linhas |
| Abertura do carrinho | Seq Scan tabela inteira | Index lookup direto |
| Painel de chat com 2k salas | Seq Scan | Index Scan |

---

## 2. EXPLAIN nas Queries — Diagnóstico de Performance

**Arquivos modificados/criados:**
- `src/core/database/database.module.ts` — slow query logging
- `src/core/database/query-profiler.service.ts` — serviço de análise
- `src/api/dashboard/dashboard.controller.ts` — endpoint `GET /dashboard/explain`
- `src/api/dashboard/dashboard.module.ts` — importa o `DatabaseModule`

### O que é EXPLAIN no PostgreSQL

`EXPLAIN` é um comando do PostgreSQL que mostra o **plano de execução** de uma query — o caminho que o banco vai percorrer para retornar os dados. Com `EXPLAIN ANALYZE`, ele executa a query de verdade e mostra o tempo real de cada etapa.

O resultado parece com isso:

```
Seq Scan on pedido  (cost=0.00..2345.00 rows=50000 width=64)
  Filter: (status <> 'CANCELADO'::status_pedido_enum)
  Rows Removed by Filter: 3000
  Actual time: 0.043..189.234 ms
```

Depois de adicionar o index:

```
Index Scan using idx_pedido_created_at_status on pedido
  (cost=0.56..89.23 rows=420 width=64)
  Index Cond: (created_at >= '2025-04-01')
  Actual time: 0.034..2.891 ms
```

A diferença de `189ms` para `2.8ms` é visível no plano.

### Mudança 1 — Slow Query Logging automático (`database.module.ts`)

```typescript
const isDev = process.env.NODE_ENV !== 'production';

const sharedOptions = {
  logging: isDev ? ['warn', 'error', 'slow'] : ['error'],
  maxQueryExecutionTime: isDev ? 200 : undefined,
};
```

**O que faz:** Em desenvolvimento, o TypeORM passa a logar automaticamente no console qualquer query que demore mais de **200ms**. O log inclui o SQL completo e o tempo de execução.

**Por que 200ms?** É o threshold onde o usuário começa a perceber lentidão. Qualquer query acima disso merece investigação.

**Por que só em dev?** Em produção, logar queries lentas tem custo de I/O e pode vazar informações sensíveis em logs. Em prod, só erros são logados.

**O que você vai ver no console em dev:**

```
[TypeORM] SLOW QUERY (342ms): SELECT p.*, c.nome FROM produto p
LEFT JOIN categoria c ON c.id_categoria = p.id_categoria ...
```

### Mudança 2 — `QueryProfilerService`

```typescript
async explain(sql: string, params: unknown[] = []): Promise<ExplainResult> {
  const plan = await this.dataSource.query(
    `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`,
    params,
  );
  ...
}
```

**O que faz:** Executa `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` em qualquer SQL que você passar. As flags significam:

- `ANALYZE` — executa a query de verdade e mostra tempo real (não apenas estimativa)
- `BUFFERS` — mostra quantos blocos de memória (cache do Postgres) foram usados
- `FORMAT JSON` — retorna o plano em JSON estruturado, fácil de processar

**`profileCriticalQueries()`:** Método que roda `EXPLAIN ANALYZE` nas 6 queries mais pesadas do sistema de uma vez: dashboard stats, pedidos recentes, histórico de pedidos, catálogo de produtos, salas de chat e agendamentos.

### Mudança 3 — Endpoint `GET /dashboard/explain`

```typescript
@Get('explain')
async explainQueries() {
  if (process.env.NODE_ENV === 'production') {
    throw new ForbiddenException('Endpoint disponível apenas em desenvolvimento');
  }
  return this.queryProfilerService.profileCriticalQueries();
}
```

**O que faz:** Endpoint protegido por JWT + role ADMIN que retorna o plano de execução JSON de todas as queries críticas.

**Por que é bloqueado em produção?** Dois motivos: (1) `EXPLAIN ANALYZE` executa a query de verdade, adicionando carga extra; (2) o plano revela detalhes da estrutura interna do banco, o que é informação sensível.

**Como usar:**
```bash
GET /dashboard/explain
Authorization: Bearer <token-admin>
```

Retorna:
```json
{
  "dashboard_sales_this_month": {
    "query": "SELECT SUM(valor_total)...",
    "executionTimeMs": 2.4,
    "plan": [{ "Node Type": "Aggregate", ... }]
  },
  "produto_find_all": {
    "executionTimeMs": 15.3,
    ...
  }
}
```

Com esses dados você consegue comparar o `executionTimeMs` **antes** e **depois** dos indexes para provar a melhoria.

---

## 3. Paginação Cursor-based

**Arquivos criados/modificados:**
- `src/shared/pagination/cursor-page.ts` — tipos e utilitários
- `src/api/catalog/produto/produto.service.ts` — `findAllPaginated()`
- `src/api/catalog/produto/produto.controller.ts` — aceita `?limit` e `?cursor`
- `src/api/pedido/pedido.service.ts` — `findAllPaginated()` e `findMyOrdersPaginated()`
- `src/api/pedido/pedido.controller.ts` — aceita `?limit` e `?cursor`
- `src/api/chat/chat.service.ts` — `getMessagesByRoomPaginated()` e `getRoomsByFilterPaginated()`
- `src/api/chat/chat.controller.ts` — aceita `?limit` e `?cursor`

### Por que paginação era necessária

Sem paginação, um único `GET /produto` carrega **todos os produtos da tabela** para a memória do servidor, serializa tudo em JSON e envia para o cliente. Com 10.000 produtos:

- O banco faz um Seq Scan completo
- O servidor aloca memória para todos os 10.000 objetos
- A resposta HTTP pode ter megabytes de tamanho
- O cliente precisa processar tudo de uma vez

Isso não escala.

### Offset/Limit vs Cursor-based — a diferença

**Paginação por offset (a forma comum):**
```sql
SELECT * FROM produto ORDER BY nome LIMIT 20 OFFSET 1000
```

O problema: para pular 1.000 linhas, o banco ainda precisa **ler as 1.000 linhas** e descartá-las. Quanto maior o offset, mais lento. Na página 500 de resultados, a query é quase tão lenta quanto buscar tudo.

Outro problema: se alguém inserir ou deletar um produto enquanto você pagina, os resultados podem pular registros ou repetir registros.

**Paginação por cursor (o que foi implementado):**
```sql
SELECT * FROM produto
WHERE (nome > 'Filtro de Ar') OR (nome = 'Filtro de Ar' AND id_produto > 452)
ORDER BY nome ASC, id_produto ASC
LIMIT 21
```

Em vez de dizer "pule X linhas", você diz "me dê os registros **depois deste ponto**". O banco usa o index para ir diretamente ao ponto certo, sem varrer nada.

**Resultado:** Performance constante independente de qual "página" você está.

### Como funciona o cursor

O cursor é um **ponteiro opaco** para o último item da página anterior. Na prática, é um objeto JSON encodado em Base64url:

```typescript
// Produto
{ nome: "Filtro de Ar", id_produto: 452 }
// Após encodeCursor() vira:
"eyJub21lIjoiRmlsdHJvIGRlIEFyIiwiaWRfcHJvZHV0byI6NDUyfQ"
```

**Por que Base64url e não apenas um ID?** Porque o cursor precisa capturar múltiplas colunas de ordenação. Se a ordenação for por `nome`, dois produtos podem ter o mesmo nome — o `id_produto` como desempate garante unicidade.

**Por que Base64url e não JSON puro?** Base64url é seguro para usar em query params de URL sem encoding adicional. Também "esconde" a estrutura interna do cursor do cliente (embora não seja segurança — é conveniência).

### Estrutura da resposta paginada

```typescript
interface CursorPage<T> {
  data: T[];           // Os itens da página atual
  nextCursor: string | null;  // null = última página
  hasMore: boolean;    // true = existe próxima página
  limit: number;       // tamanho da página retornada
}
```

**O truque do `limit + 1`:**
```typescript
qb.take(limit + 1); // pedimos 21 se o limite é 20

const hasMore = rows.length > limit; // se vieram 21, tem mais
const data = hasMore ? rows.slice(0, limit) : rows; // retornamos 20
```

Em vez de fazer um `COUNT(*)` extra (que percorre a tabela inteira), pedimos um registro a mais. Se voltaram `limit+1` registros, sabemos que há mais — e descartamos o último. Simples e eficiente.

### Backward compatibility

Os endpoints antigos continuam funcionando sem alteração:

```typescript
@Get()
findAll(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
  if (cursor !== undefined || limit !== undefined) {
    return this.produtoService.findAllPaginated(...);
  }
  return this.produtoService.findAll(); // comportamento original
}
```

Qualquer cliente que já usava `GET /produto` sem parâmetros continua recebendo todos os produtos. A paginação é opt-in.

### Como usar a paginação

**Primeira página:**
```
GET /produto?limit=20
```

**Resposta:**
```json
{
  "data": [...20 produtos...],
  "nextCursor": "eyJub21lIjoiRml...",
  "hasMore": true,
  "limit": 20
}
```

**Próxima página:**
```
GET /produto?limit=20&cursor=eyJub21lIjoiRml...
```

Repita até `hasMore: false` ou `nextCursor: null`.

### Endpoints com paginação disponível

| Endpoint | Ordenação do cursor | Limite padrão |
|---|---|---|
| `GET /produto?limit=&cursor=` | `(nome ASC, id_produto ASC)` | 20 |
| `GET /pedidos/admin/all?limit=&cursor=` | `(created_at DESC, id_pedido DESC)` | 20 |
| `GET /pedidos/my-orders?limit=&cursor=` | `(created_at DESC, id_pedido DESC)` | 20 |
| `GET /chat/rooms/:id/messages?limit=&cursor=` | `(created_at ASC, id ASC)` | 50 |
| `GET /chat/rooms/filter?status=&limit=&cursor=` | `(created_at DESC, id DESC)` | 25 |

**Limite máximo:** 100 em todos os endpoints (hardcoded como proteção contra abusos).

---

## 4. Redis — Cache com Docker

**Arquivos criados/modificados:**
- `docker/docker-compose.yml` — container Redis
- `.env` e `.env- template` — variáveis `REDIS_HOST` e `REDIS_PORT`
- `src/core/cache/cache.module.ts` — módulo global de cache
- `src/app.module.ts` — registra o `AppCacheModule`
- `src/api/catalog/produto/produto.service.ts` — cache do catálogo
- `src/api/dashboard/dashboard.service.ts` — cache das estatísticas
- `src/api/pedido/pedido.service.ts` — invalidação do cache do dashboard

### O que é Redis e por que usá-lo

Redis é um banco de dados **em memória** (RAM), extremamente rápido. Uma leitura no PostgreSQL com um bom index leva 1-5ms. Uma leitura no Redis leva **0.1-0.3ms** — 10 a 50x mais rápido.

A ideia é: se uma query é cara de executar mas o resultado não muda com frequência, você armazena o resultado no Redis e serve da memória nas próximas requisições.

### Por que local com Docker em vez de cloud (Upstash)

Para o ambiente de desenvolvimento local, um container Docker é mais simples:
- Não precisa de conta externa
- Funciona offline
- Zero latência (tudo local)
- Mesma imagem `redis:7-alpine` usada em produção

### Configuração do container

```yaml
redis:
  container_name: booster_redis
  image: redis:7-alpine
  restart: always
  ports:
    - '6379:6379'
  volumes:
    - redisdata:/data
  command: redis-server --appendonly yes
```

**`redis:7-alpine`:** Versão Alpine Linux — imagem mínima, ~40MB. Versão 7 é a mais recente estável.

**`--appendonly yes`:** Ativa persistência. Sem isso, o Redis perde todos os dados quando o container reinicia. Com `appendonly`, ele grava cada operação em um arquivo de log (`.aof`) e reconstrói o estado ao reiniciar.

**`restart: always`:** Container reinicia automaticamente se travar ou se o Docker reiniciar.

**Volume `redisdata`:** Os dados persistem em volume nomeado, separado do container. Destruir o container não destrói os dados.

### Pacotes instalados

```
@nestjs/cache-manager   — integração NestJS com cache-manager
cache-manager           — abstração de cache (v7, baseada em Keyv)
@keyv/redis             — adapter Redis para Keyv (API do cache-manager v7)
```

**Por que `@keyv/redis` e não `ioredis` direto?** O `cache-manager` v7 migrou para a abstração `Keyv`, que tem adapters para Redis, Memcached, SQLite, etc. O `@keyv/redis` é o adapter oficial. Isso nos permite trocar de Redis para outro store sem mudar o código da aplicação.

### `AppCacheModule` — o módulo global

```typescript
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService) => ({
        stores: [new KeyvRedis(`redis://${host}:${port}`)],
      }),
    }),
  ],
})
export class AppCacheModule {}
```

**`@Global()`:** O decorator `@Global()` no NestJS faz com que o módulo e seus providers fiquem disponíveis para todos os outros módulos da aplicação sem precisar importar explicitamente. Isso significa que qualquer service pode injetar `CACHE_MANAGER` sem declarar nada no seu próprio módulo.

**`isGlobal: true` no `registerAsync`:** Garante que o `CACHE_MANAGER` token seja registrado globalmente no container de injeção de dependência do NestJS.

**`stores: [new KeyvRedis(...)]`:** A API do cache-manager v7 aceita um array de stores. O primeiro store é o principal. Você poderia adicionar um segundo store como fallback (ex: cache em memória), mas aqui usamos só o Redis para simplicidade.

### Cache no `ProdutoService`

```typescript
const CACHE_TTL_PRODUTO = 60 * 60 * 1000; // 1 hora em ms
const CACHE_KEY_PRODUTO_ALL = 'produto:all';

async findAll(): Promise<Produto[]> {
  const cached = await this.cacheManager.get<Produto[]>(CACHE_KEY_PRODUTO_ALL);
  if (cached) return cached;

  const produtos = await this.produtoRepository.find({ ... });
  await this.cacheManager.set(CACHE_KEY_PRODUTO_ALL, produtos, CACHE_TTL_PRODUTO);
  return produtos;
}
```

**Fluxo:**
1. Chegou uma request `GET /produto`
2. Verifica no Redis: existe a chave `produto:all`?
3. **Se sim:** retorna o valor do Redis. Zero acesso ao banco. ~0.2ms.
4. **Se não:** consulta o banco, armazena no Redis por 1 hora, retorna.

**Por que TTL de 1 hora para produtos?** O catálogo de produtos não muda o tempo todo. Um admin raramente cria ou edita 10 produtos por hora. 1 hora é um equilíbrio entre frescor dos dados e redução de carga.

**Invalidação ao escrever:**
```typescript
async create(createProdutoDto): Promise<Produto> {
  const saved = await this.produtoRepository.save(produto);
  await this.cacheManager.del(CACHE_KEY_PRODUTO_ALL); // invalida cache
  return saved;
}
```

Quando um admin cria, atualiza ou remove um produto, o cache `produto:all` é imediatamente deletado. A próxima leitura vai ao banco e reconstrói o cache. Isso garante que nenhum cliente veja dados desatualizados após uma mudança.

**Este é o padrão Cache-Aside (ou Lazy Loading):** você só popula o cache quando há uma leitura, não na escrita. É o padrão mais seguro e comum.

### Cache no `DashboardService`

```typescript
const CACHE_TTL_STATS = 15 * 60 * 1000;        // 15 minutos
const CACHE_TTL_RECENT_ORDERS = 2 * 60 * 1000; // 2 minutos
```

**Por que TTLs diferentes?**

- **Stats (15min):** Envolve 5 queries incluindo dois `SUM()` e um `COUNT()` na tabela de pedidos. São dados agregados que mudam gradualmente. Um admin toleraria ver os números de 15 minutos atrás sem problema.

- **Pedidos recentes (2min):** É uma lista de pedidos individuais visível no dashboard. Se um novo pedido chegou, o admin provavelmente quer ver logo. 2 minutos é um equilíbrio razoável.

### Invalidação do cache do dashboard via `PedidoService`

```typescript
// Em pedido.service.ts — ao criar um pedido:
await Promise.all([
  this.cacheManager.del('dashboard:stats'),
  this.cacheManager.del('dashboard:recent-orders'),
]);
```

**Por que invalidar ao criar um pedido?** Um novo pedido afeta diretamente as stats do dashboard (total de vendas, total de pedidos) e aparece nos pedidos recentes. Sem invalidação, o admin veria dados desatualizados por até 15 minutos.

**`Promise.all()`:** As duas deleções do cache são independentes entre si. `Promise.all()` as executa em paralelo, em vez de sequencialmente. Em vez de esperar 0.2ms + 0.2ms, espera apenas os 0.2ms do que terminar por último.

O mesmo acontece quando um admin atualiza o status de um pedido (`updateStatus`) — o status afeta o cálculo de vendas (pedidos CANCELADOS são excluídos).

### Resumo das chaves de cache e TTLs

| Chave Redis | Service | TTL | Invalidada quando |
|---|---|---|---|
| `produto:all` | `ProdutoService.findAll()` | 1 hora | `create`, `update`, `remove` de produto |
| `dashboard:stats` | `DashboardService.getStats()` | 15 min | novo pedido, `updateStatus` |
| `dashboard:recent-orders` | `DashboardService.getRecentOrders()` | 2 min | novo pedido, `updateStatus` |

### Como subir o Redis junto com o banco

```bash
cd backend-booster/docker
docker compose up -d
```

O Redis vai estar disponível em `localhost:6379`.

**Para verificar se está rodando:**
```bash
docker exec -it booster_redis redis-cli ping
# Resposta esperada: PONG
```

**Para ver as chaves de cache em tempo real:**
```bash
docker exec -it booster_redis redis-cli monitor
```

---

## Visão geral do impacto combinado

As 4 melhorias se complementam:

```
Requisição GET /produto

Sem melhorias:
  → Banco faz Seq Scan em 10.000 linhas (~150ms)
  → Servidor serializa 10.000 objetos
  → Cliente recebe ~2MB de JSON

Com paginação:
  → Banco retorna 20 linhas (~5ms com index)
  → Servidor serializa 20 objetos
  → Cliente recebe ~4KB de JSON

Com cache + paginação (segunda requisição):
  → Redis retorna dados em memória (~0.2ms)
  → Zero acesso ao banco
  → Cliente recebe ~4KB de JSON
```

```
Requisição GET /dashboard/stats

Sem melhorias:
  → 5 queries no banco (2x SUM + 2x COUNT + 1x COUNT)
  → Seq Scan em cada uma (~500ms total)

Com indexes:
  → As mesmas 5 queries (~10ms total com indexes)

Com cache + indexes (segunda requisição em 15min):
  → Redis retorna resultado (~0.2ms)
  → Zero acesso ao banco
```

A combinação de **index + paginação + cache** é o que separa um backend que escala de um que trava quando cresce.
