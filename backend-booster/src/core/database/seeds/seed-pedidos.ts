import { DataSource } from 'typeorm';

const TOTAL_PEDIDOS = 50000;
const ITENS_POR_PEDIDO = 3;

const BATCH_SIZE = 500;

const STATUS = ['PENDENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max));
}

function randomStatus() {
  return STATUS[randomInt(0, STATUS.length)];
}

function randomPrice() {
  return Number(randomBetween(10, 5000).toFixed(2));
}

function randomDateLast2Years() {
  const now = Date.now();
  const twoYearsAgo = now - 1000 * 60 * 60 * 24 * 365 * 2;
  return new Date(randomBetween(twoYearsAgo, now));
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length)];
}

export async function seedPedidos(dataSource: DataSource): Promise<void> {
  console.log('🧹 Limpando pedidos...');

  await dataSource.query(`DELETE FROM pedido_item`);
  await dataSource.query(`DELETE FROM pedido`);

  console.log('📥 Buscando usuários...');

  const usuarios = await dataSource.query(`SELECT id_usuario FROM usuario`);

  if (!usuarios.length) {
    throw new Error('Nenhum usuário encontrado. Rode seedUsuarios primeiro.');
  }

  const usuariosIds = usuarios.map((u: any) => u.id_usuario);

  console.log('📥 Buscando produtos...');

  const produtos = await dataSource.query(`SELECT id_produto FROM produto`);

  if (!produtos.length) {
    throw new Error('Nenhum produto encontrado. Rode seedCatalogo primeiro.');
  }

  const produtosIds = produtos.map((p: any) => p.id_produto);

  console.log('📦 Gerando pedidos...');

  let pedidosValues: any[] = [];
  let pedidosPlaceholders: string[] = [];

  let pedidoItemsValues: any[] = [];
  let pedidoItemsPlaceholders: string[] = [];

  let pedidosParamIndex = 1;
  let itensParamIndex = 1;

  let pedidoIdAtual = 1;

  for (let i = 1; i <= TOTAL_PEDIDOS; i++) {
    const usuarioId = pickRandom(usuariosIds);
    const dataHora = randomDateLast2Years();
    const status = randomStatus();

    let valorTotal = 0;
    const itensPedido: { produtoId: unknown; quantidade: number; precoUnitario: number }[] = [];

    for (let j = 0; j < ITENS_POR_PEDIDO; j++) {
      const produtoId = pickRandom(produtosIds);
      const quantidade = randomInt(1, 11);
      const precoUnitario = randomPrice();
      valorTotal += quantidade * precoUnitario;
      itensPedido.push({ produtoId, quantidade, precoUnitario });
    }

    pedidosValues.push(usuarioId, dataHora, valorTotal, status);

    pedidosPlaceholders.push(
      `($${pedidosParamIndex++},$${pedidosParamIndex++},$${pedidosParamIndex++},$${pedidosParamIndex++})`,
    );

    for (const item of itensPedido) {
      pedidoItemsValues.push(
        pedidoIdAtual,
        item.produtoId,
        item.quantidade,
        item.precoUnitario,
      );

      pedidoItemsPlaceholders.push(
        `($${itensParamIndex++},$${itensParamIndex++},$${itensParamIndex++},$${itensParamIndex++})`,
      );
    }

    pedidoIdAtual++;

    if (i % BATCH_SIZE === 0) {
      await dataSource.query(
        `
INSERT INTO pedido
(id_cliente,data_hora,valor_total,status)
VALUES
${pedidosPlaceholders.join(',')}
`,
        pedidosValues,
      );

      await dataSource.query(
        `
INSERT INTO pedido_item
(id_pedido,id_produto,quantidade,preco_unitario)
VALUES
${pedidoItemsPlaceholders.join(',')}
`,
        pedidoItemsValues,
      );

      process.stdout.write(`Pedidos inseridos ${i}/${TOTAL_PEDIDOS}\r`);

      pedidosValues = [];
      pedidosPlaceholders = [];
      pedidoItemsValues = [];
      pedidoItemsPlaceholders = [];
      pedidosParamIndex = 1;
      itensParamIndex = 1;
    }
  }

  if (pedidosValues.length > 0) {
    await dataSource.query(
      `
INSERT INTO pedido
(id_cliente,data_hora,valor_total,status)
VALUES
${pedidosPlaceholders.join(',')}
`,
      pedidosValues,
    );

    await dataSource.query(
      `
INSERT INTO pedido_item
(id_pedido,id_produto,quantidade,preco_unitario)
VALUES
${pedidoItemsPlaceholders.join(',')}
`,
      pedidoItemsValues,
    );
  }

  console.log('\n✅ seedPedidos finalizado');
}
