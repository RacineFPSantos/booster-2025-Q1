# Guia de Migrations - Booster Backend

## 📋 Visão Geral

Este projeto usa **TypeORM Migrations** para gerenciar o schema do banco de dados de forma versionada e sincronizada.

## 🎯 Fonte Única da Verdade

**Arquivo:** `src/common/enums/database.enums.ts`

Todos os enums do banco de dados são definidos **UMA ÚNICA VEZ** neste arquivo e reutilizados em:
- Entities
- Migrations
- Validações

## 🚀 Como Usar

### 1️⃣ Primeira vez - Criar o banco do zero

```bash
# 1. Criar o banco de dados vazio no PostgreSQL
# (via pgAdmin, psql ou seu gerenciador favorito)

# 2. Executar as migrations
npm run migration:run
```

Isso criará:
- ✅ Enums: `tipo_cliente_enum`, `status_pedido_enum`
- ✅ Tabelas: `cliente`, `categoria`, `fabricante`, `produto`, `pedido`, `pedido_item`, `estoque`
- ✅ Triggers para `updated_at`
- ✅ Constraints e Foreign Keys

### 2️⃣ Adicionar um novo valor a um ENUM

**Exemplo:** Adicionar "GOVERNO" ao `tipo_cliente_enum`

**Passo 1:** Atualizar o enum centralizado
```typescript
// src/common/enums/database.enums.ts
export enum TipoClienteEnum {
  PF = 'PF',
  PJ = 'PJ',
  GOVERNO = 'GOVERNO', // ← Novo valor
}
```

**Passo 2:** Criar uma migration
```bash
npm run migration:create src/databases/migrations/AddGovernoToTipoCliente
```

**Passo 3:** Editar a migration criada
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGovernoToTipoCliente1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE tipo_cliente_enum ADD VALUE 'GOVERNO';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ATENÇÃO: PostgreSQL não permite remover valores de ENUM facilmente
    // Você precisaria recriar o tipo ou deixar o valor no banco
    throw new Error('Cannot remove enum value in PostgreSQL');
  }
}
```

**Passo 4:** Executar a migration
```bash
npm run migration:run
```

### 3️⃣ Criar uma nova tabela ou coluna

**Opção A:** Gerar automaticamente (recomendado)
```bash
npm run migration:generate src/databases/migrations/AddTabelaX
```

**Opção B:** Criar manualmente
```bash
npm run migration:create src/databases/migrations/AddTabelaX
```

### 4️⃣ Ver status das migrations

```bash
npm run migration:show
```

### 5️⃣ Reverter a última migration

```bash
npm run migration:revert
```

## 🔍 Validação Automática de Enums

Ao iniciar a aplicação, o sistema **automaticamente verifica** se os enums no banco estão sincronizados com o código.

Você verá mensagens como:

✅ **Tudo sincronizado:**
```
✅ Enum 'tipo_cliente_enum' está sincronizado entre código e banco de dados
✅ Enum 'status_pedido_enum' está sincronizado entre código e banco de dados
```

⚠️ **Faltando no código:**
```
⚠️  ATENÇÃO: O enum 'tipo_cliente_enum' no banco possui valores que não estão no código TypeScript: GOVERNO
Por favor, atualize o TipoClienteEnum em src/common/enums/database.enums.ts
```

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run migration:generate src/databases/migrations/NomeDaMigration` | Gera migration automaticamente comparando entities com banco |
| `npm run migration:create src/databases/migrations/NomeDaMigration` | Cria migration vazia para editar manualmente |
| `npm run migration:run` | Executa todas as migrations pendentes |
| `npm run migration:revert` | Reverte a última migration executada |
| `npm run migration:show` | Mostra status de todas as migrations |

## ⚠️ Boas Práticas

1. **NUNCA** use `synchronize: true` em produção
2. **SEMPRE** crie migrations para mudanças no schema
3. **SEMPRE** atualize o enum em `src/common/enums/database.enums.ts` primeiro
4. **SEMPRE** teste a migration antes de fazer commit
5. **NUNCA** edite uma migration que já foi executada em produção

## 🔄 Workflow Recomendado

```
1. Atualizar src/common/enums/database.enums.ts
2. Criar migration (npm run migration:create ...)
3. Editar migration com ALTER TYPE
4. Testar localmente (npm run migration:run)
5. Commit (código + migration)
6. Deploy (executa migrations automaticamente ou manualmente)
```

## 🐛 Troubleshooting

### Erro: "relation already exists"
- O banco já tem essa tabela. Use `migration:revert` ou crie o banco do zero.

### Erro: "enum value already exists"
- O valor já está no banco. Pule essa migration ou reverta.

### Erro: "Cannot remove enum value"
- PostgreSQL não permite remover valores de ENUM. Soluções:
  1. Deixar o valor no banco (não usar mais no código)
  2. Criar um novo enum e migrar os dados
  3. Dropar e recriar o tipo (perigoso!)

## 📚 Mais Informações

- [TypeORM Migrations](https://typeorm.io/migrations)
- [PostgreSQL ENUM Types](https://www.postgresql.org/docs/current/datatype-enum.html)
