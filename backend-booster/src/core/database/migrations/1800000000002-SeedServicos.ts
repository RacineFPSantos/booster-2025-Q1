import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Dados iniciais obrigatórios para o módulo de serviços.
 * Tipos de serviço e serviços padrão da oficina.
 */
export class SeedServicos1800000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ count }] = await queryRunner.query<[{ count: string }]>(`
      SELECT COUNT(*)::int AS count FROM servico
    `);

    if (Number(count) > 0) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO tipo_servico (nome, descricao) VALUES
        ('Manutenção Preventiva', 'Serviços de manutenção regular e preventiva do veículo'),
        ('Manutenção Corretiva',  'Reparos e correções de problemas do veículo'),
        ('Diagnóstico',          'Análise e diagnóstico de problemas'),
        ('Estética Automotiva',  'Serviços de limpeza, polimento e estética'),
        ('Instalação',           'Instalação de acessórios e componentes')
    `);

    await queryRunner.query(`
      INSERT INTO servico (nome, descricao, preco, duracao_estimada, id_tipo_servico) VALUES
        ('Troca de Óleo',                'Troca de óleo do motor com filtro, verificação de níveis e inspeção visual completa', 150.00, 45,  1),
        ('Alinhamento e Balanceamento',  'Alinhamento computadorizado das rodas e balanceamento completo dos pneus',            120.00, 60,  1),
        ('Revisão de Freios',            'Inspeção completa do sistema de freios, pastilhas, discos e fluido',                  200.00, 90,  1),
        ('Troca de Pastilhas de Freio',  'Substituição das pastilhas de freio dianteiras ou traseiras',                        280.00, 120, 2),
        ('Troca de Correia Dentada',     'Substituição da correia dentada do motor com verificação de tensionadores',           450.00, 180, 2),
        ('Diagnóstico Computadorizado',  'Análise completa do sistema eletrônico do veículo com scanner automotivo',            80.00, 30,  3),
        ('Troca de Bateria',             'Substituição da bateria com teste do sistema elétrico',                               350.00, 30,  2),
        ('Limpeza de Injetores',         'Limpeza profunda dos bicos injetores de combustível',                                 180.00, 90,  1),
        ('Polimento e Cristalização',    'Polimento completo da pintura com aplicação de cristalizador',                        400.00, 240, 4),
        ('Instalação de Som Automotivo', 'Instalação completa de sistema de som com chicotes e conectores',                     150.00, 120, 5),
        ('Higienização de Ar-Condicionado', 'Limpeza completa do sistema de ar-condicionado com produtos especializados',      120.00, 60,  1),
        ('Troca de Amortecedores',       'Substituição dos amortecedores dianteiros ou traseiros',                              600.00, 180, 2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM servico`);
    await queryRunner.query(`DELETE FROM tipo_servico`);
  }
}
