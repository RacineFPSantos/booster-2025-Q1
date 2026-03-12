import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProdutos1769100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Inserir categorias
    await queryRunner.query(`
      INSERT INTO categoria (nome) VALUES
      ('Óleos e Lubrificantes'),
      ('Filtros'),
      ('Freios'),
      ('Suspensão e Direção'),
      ('Elétrica e Ignição'),
      ('Pneus e Rodas'),
      ('Acessórios'),
      ('Correias e Tensionadores')
      ON CONFLICT (nome) DO NOTHING;
    `);

    // Inserir fabricantes
    await queryRunner.query(`
      INSERT INTO fabricante (cnpj, nome) VALUES
      ('60453764000109', 'Bosch'),
      ('00358835000129', 'NGK'),
      ('02376027000171', 'Mann-Filter'),
      ('33000118000179', 'Mobil'),
      ('00558274000100', 'Pirelli'),
      ('07175827000110', 'Monroe'),
      ('17065966000106', 'Cofap'),
      ('34274233000102', 'Varta')
      ON CONFLICT (cnpj) DO NOTHING;
    `);

    // Inserir produtos (referenciando categorias e fabricantes)
    await queryRunner.query(`
      INSERT INTO produto (nome, descricao, preco_unitario, imagem_url, id_categoria, id_fabricante)
      SELECT p.nome, p.descricao, p.preco::numeric, p.imagem_url, c.id_categoria, f.id_fabricante
      FROM (VALUES
        ('Óleo Motor 5W-30 Sintético 1L',       'Óleo lubrificante sintético para motores a gasolina e flex',          '45.90',  '/static/images/produtos/oleo-5w30.jpg',              'Óleos e Lubrificantes',    'Mobil'),
        ('Óleo Motor 5W-40 Sintético 1L',       'Óleo lubrificante sintético de alto desempenho',                       '52.90',  '/static/images/produtos/oleo-5w40.jpg',              'Óleos e Lubrificantes',    'Mobil'),
        ('Óleo de Câmbio ATF 1L',               'Fluido para transmissões automáticas',                                  '38.50',  '/static/images/produtos/oleo-atf.jpg',               'Óleos e Lubrificantes',    'Mobil'),
        ('Fluido de Freio DOT 4 500ml',         'Fluido de freio de alta performance',                                   '22.90',  '/static/images/produtos/fluido-freio-dot4.jpg',      'Freios',                   'Bosch'),
        ('Filtro de Óleo',                      'Filtro de óleo para motores 1.0 a 2.0',                                 '32.00',  '/static/images/produtos/filtro-oleo.jpg',            'Filtros',                  'Mann-Filter'),
        ('Filtro de Ar',                        'Filtro de ar para motores a gasolina e flex',                           '28.50',  '/static/images/produtos/filtro-ar.jpg',              'Filtros',                  'Mann-Filter'),
        ('Filtro de Combustível',               'Filtro de combustível para carros flex',                                '35.00',  '/static/images/produtos/filtro-combustivel.jpg',     'Filtros',                  'Mann-Filter'),
        ('Filtro de Cabine',                    'Filtro de ar-condicionado e cabine',                                    '45.00',  '/static/images/produtos/filtro-cabine.jpg',          'Filtros',                  'Mann-Filter'),
        ('Pastilha de Freio Dianteira',         'Pastilha de freio dianteira para veículos de passeio',                 '89.90',  '/static/images/produtos/pastilha-dianteira.jpg',     'Freios',                   'Bosch'),
        ('Pastilha de Freio Traseira',          'Pastilha de freio traseira para veículos de passeio',                  '79.90',  '/static/images/produtos/pastilha-traseira.jpg',      'Freios',                   'Bosch'),
        ('Disco de Freio Dianteiro',            'Disco de freio ventilado dianteiro',                                   '145.00', '/static/images/produtos/disco-dianteiro.jpg',        'Freios',                   'Cofap'),
        ('Disco de Freio Traseiro',             'Disco de freio traseiro sólido',                                       '125.00', '/static/images/produtos/disco-traseiro.jpg',         'Freios',                   'Cofap'),
        ('Amortecedor Dianteiro',               'Amortecedor dianteiro para veículos de passeio',                       '210.00', '/static/images/produtos/amortecedor-dianteiro.jpg',  'Suspensão e Direção',      'Monroe'),
        ('Amortecedor Traseiro',                'Amortecedor traseiro para veículos de passeio',                        '190.00', '/static/images/produtos/amortecedor-traseiro.jpg',   'Suspensão e Direção',      'Monroe'),
        ('Vela de Ignição (jogo 4un)',          'Jogo de velas de ignição para motores 1.0 a 2.0',                       '68.00',  '/static/images/produtos/vela-ignicao.jpg',           'Elétrica e Ignição',       'NGK'),
        ('Cabo de Vela (jogo)',                 'Jogo de cabos de vela de alta condutividade',                           '95.00',  '/static/images/produtos/cabo-vela.jpg',              'Elétrica e Ignição',       'Bosch'),
        ('Bateria 60Ah',                        'Bateria automotiva 60Ah livre de manutenção',                          '389.00', '/static/images/produtos/bateria-60ah.jpg',           'Elétrica e Ignição',       'Varta'),
        ('Bateria 45Ah',                        'Bateria automotiva 45Ah para carros de pequeno porte',                 '289.00', '/static/images/produtos/bateria-45ah.jpg',           'Elétrica e Ignição',       'Varta'),
        ('Correia Dentada',                     'Correia dentada para motores 1.0 a 2.0',                               '75.00',  '/static/images/produtos/correia-dentada.jpg',        'Correias e Tensionadores', 'Bosch'),
        ('Kit Correia Dentada com Tensionador', 'Kit completo de correia dentada com tensor e rolamento',               '185.00', '/static/images/produtos/kit-correia-dentada.jpg',    'Correias e Tensionadores', 'Bosch'),
        ('Correia Poly-V',                      'Correia acessórios (alternador, ar-condicionado)',                      '55.00',  '/static/images/produtos/correia-polyv.jpg',          'Correias e Tensionadores', 'Bosch'),
        ('Pneu 185/65 R15',                     'Pneu para veículos de passeio aro 15',                                 '320.00', '/static/images/produtos/pneu-185-65-r15.jpg',        'Pneus e Rodas',            'Pirelli'),
        ('Pneu 195/55 R15',                     'Pneu esportivo para veículos de passeio aro 15',                       '355.00', '/static/images/produtos/pneu-195-55-r15.jpg',        'Pneus e Rodas',            'Pirelli'),
        ('Capa de Volante Universal',           'Capa de volante em couro sintético antiderrapante',                    '49.90',  '/static/images/produtos/capa-volante.jpg',           'Acessórios',               'Bosch'),
        ('Tapete Automotivo (jogo 4un)',        'Jogo de tapetes em borracha universal',                                 '69.90',  '/static/images/produtos/tapete-automotivo.jpg',      'Acessórios',               'Cofap')
      ) AS p(nome, descricao, preco, imagem_url, categoria_nome, fabricante_nome)
      JOIN categoria c ON c.nome = p.categoria_nome
      JOIN fabricante f ON f.nome = p.fabricante_nome;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM produto WHERE nome IN (
      'Óleo Motor 5W-30 Sintético 1L', 'Óleo Motor 5W-40 Sintético 1L', 'Óleo de Câmbio ATF 1L',
      'Fluido de Freio DOT 4 500ml', 'Filtro de Óleo', 'Filtro de Ar', 'Filtro de Combustível',
      'Filtro de Cabine', 'Pastilha de Freio Dianteira', 'Pastilha de Freio Traseira',
      'Disco de Freio Dianteiro', 'Disco de Freio Traseiro', 'Amortecedor Dianteiro',
      'Amortecedor Traseiro', 'Vela de Ignição (jogo 4un)', 'Cabo de Vela (jogo)',
      'Bateria 60Ah', 'Bateria 45Ah', 'Correia Dentada', 'Kit Correia Dentada com Tensionador',
      'Correia Poly-V', 'Pneu 185/65 R15', 'Pneu 195/55 R15',
      'Capa de Volante Universal', 'Tapete Automotivo (jogo 4un)'
    );`);

    await queryRunner.query(`DELETE FROM fabricante WHERE nome IN (
      'Bosch', 'NGK', 'Mann-Filter', 'Mobil', 'Pirelli', 'Monroe', 'Cofap', 'Varta'
    );`);

    await queryRunner.query(`DELETE FROM categoria WHERE nome IN (
      'Óleos e Lubrificantes', 'Filtros', 'Freios', 'Suspensão e Direção',
      'Elétrica e Ignição', 'Pneus e Rodas', 'Acessórios', 'Correias e Tensionadores'
    );`);
  }
}
