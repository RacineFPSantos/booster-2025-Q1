import { DataSource } from 'typeorm';

const BATCH_SIZE = 500;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function randomPrice(min = 10, max = 5000) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function randomCNPJ() {
  let cnpj = '';
  for (let i = 0; i < 14; i++) {
    cnpj += Math.floor(Math.random() * 10);
  }
  return cnpj;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/*
|--------------------------------------------------------------------------
| Dados catálogo
|--------------------------------------------------------------------------
*/

const categorias = [
  'Freios',
  'Suspensão',
  'Motor',
  'Elétrica',
  'Filtros',
  'Transmissão',
  'Direção',
  'Arrefecimento',
  'Escape',
  'Combustível',
  'Ignição',
  'Embreagem',
  'Rolamentos',
  'Amortecedores',
  'Radiadores',
  'Ventoinhas',
  'Correias',
  'Tensor',
  'Velas',
  'Cabos de vela',
  'Bobinas',
  'Alternadores',
  'Motores de partida',
  'Sensores',
  'Módulos ECU',
  'Injeção eletrônica',
  'Bombas combustível',
  'Bombas óleo',
  'Bombas água',
  'Juntas motor',
  'Retentores',
  'Tuchos',
  'Comandos válvula',
  'Virabrequim',
  'Pistões',
  'Anéis pistão',
  'Bielas',
  'Cabeçote',
  'Válvulas',
  'Catalisadores',
  'Silenciosos',
  'Lanternas',
  'Faróis',
  'Retrovisores',
  'Parachoques',
  'Portas',
  'Capô',
  'Teto',
  'Vidros',
  'Palhetas limpador',
];

const fabricantesBase = [
  'Bosch',
  'Magneti Marelli',
  'Valeo',
  'Mahle',
  'SKF',
  'NGK',
  'Denso',
  'Continental',
  'Delphi',
  'TRW',
  'Monroe',
  'Cofap',
  'Nakada',
  'Fras-le',
  'Cobreq',
  'Sachs',
  'ZF',
  'Luk',
  'Pierburg',
  'MTE-Thomson',
  'VDO',
  'Hella',
  'Philips',
  'Osram',
  'Dayco',
  'Gates',
  'Ina',
  'Elring',
  'Ajusa',
  'Sabó',
];

function gerarFabricantes(total: number) {
  const fabricantes: string[] = [];

  for (let i = 0; i < total; i++) {
    const base = fabricantesBase[i % fabricantesBase.length];
    fabricantes.push(`${base} AutoParts ${i}`);
  }

  return fabricantes;
}

const nomesProdutos = [
  'Pastilha de freio',
  'Disco de freio',
  'Amortecedor dianteiro',
  'Amortecedor traseiro',
  'Filtro de óleo',
  'Filtro de ar',
  'Filtro de combustível',
  'Velas de ignição',
  'Bobina de ignição',
  'Bomba combustível',
  'Radiador',
  'Alternador',
  'Motor partida',
  'Sensor ABS',
  'Sensor MAP',
  'Sensor temperatura',
  'Junta cabeçote',
  'Correia dentada',
  'Tensor correia',
  'Bomba água',
  'Bomba óleo',
  'Catalisador',
  'Silencioso traseiro',
  'Lanterna traseira',
  'Farol dianteiro',
  'Retrovisor elétrico',
  'Parachoque dianteiro',
  'Parachoque traseiro',
  'Palheta limpador',
  'Rolamento roda',
];

const modelos = [
  'Gol',
  'Uno',
  'Palio',
  'Civic',
  'Corolla',
  'HB20',
  'Onix',
  'Fiesta',
  'Focus',
  'Cruze',
  'Tracker',
  'Renegade',
  'Toro',
  'Hilux',
  'S10',
  'Strada',
  'Saveiro',
];

function gerarNomeProduto() {
  const base = pickRandom(nomesProdutos);
  const modelo = pickRandom(modelos);
  return `${base} ${modelo}`;
}

/*
|--------------------------------------------------------------------------
| Seed principal
|--------------------------------------------------------------------------
*/

export async function seedCatalogo(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();

  console.log('🧹 Limpando tabelas catálogo...');

  await queryRunner.query('DELETE FROM produto');
  await queryRunner.query('DELETE FROM fabricante');
  await queryRunner.query('DELETE FROM categoria');

  console.log('📦 Inserindo categorias...');

  const categoriasInseridas = await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into('categoria')
    .values(categorias.map((nome) => ({ nome })))
    .returning('*')
    .execute();

  const categoriasIds = categoriasInseridas.raw.map((c: any) => c.id_categoria);

  console.log('🏭 Inserindo fabricantes...');

  const fabricantes = gerarFabricantes(100);

  const fabricantesInseridos = await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into('fabricante')
    .values(
      fabricantes.map((nome) => ({
        nome,
        cnpj: randomCNPJ(),
      })),
    )
    .returning('*')
    .execute();

  const fabricantesIds = fabricantesInseridos.raw.map(
    (f: any) => f.id_fabricante,
  );

  console.log('🚗 Inserindo produtos (10.000)...');

  let buffer: any[] = [];

  for (let i = 0; i < 10000; i++) {
    buffer.push({
      nome: gerarNomeProduto(),
      descricao: 'Autopeça de alta qualidade',
      imagem_url: null,
      preco_unitario: randomPrice(),
      id_categoria: pickRandom(categoriasIds),
      id_fabricante: pickRandom(fabricantesIds),
    });

    if (buffer.length === BATCH_SIZE) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('produto')
        .values(buffer)
        .execute();

      buffer = [];

      process.stdout.write(`Inseridos ${i + 1}/10000\r`);
    }
  }

  if (buffer.length > 0) {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('produto')
      .values(buffer)
      .execute();
  }

  console.log('\n✅ Seed catálogo finalizado com sucesso!');

  await queryRunner.release();
}
