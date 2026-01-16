import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateServicosTables1768583084196 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela tipo_servico
    await queryRunner.createTable(
      new Table({
        name: 'tipo_servico',
        columns: [
          {
            name: 'id_tipo_servico',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'descricao',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp without time zone',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp without time zone',
            default: 'NOW()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Criar tabela servico
    await queryRunner.createTable(
      new Table({
        name: 'servico',
        columns: [
          {
            name: 'id_servico',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'descricao',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'preco',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'duracao_estimada',
            type: 'int',
            isNullable: false,
            comment: 'Duração em minutos',
          },
          {
            name: 'id_tipo_servico',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'ativo',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp without time zone',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp without time zone',
            default: 'NOW()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign key: servico -> tipo_servico
    await queryRunner.createForeignKey(
      'servico',
      new TableForeignKey({
        columnNames: ['id_tipo_servico'],
        referencedColumnNames: ['id_tipo_servico'],
        referencedTableName: 'tipo_servico',
        onDelete: 'RESTRICT',
      }),
    );

    // Criar tabela agendamento
    await queryRunner.createTable(
      new Table({
        name: 'agendamento',
        columns: [
          {
            name: 'id_agendamento',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'id_servico',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'id_usuario',
            type: 'int',
            isNullable: true,
            comment: 'Null se não for usuário cadastrado',
          },
          {
            name: 'data_agendamento',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'hora_agendamento',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'telefone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'veiculo',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'observacoes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'PENDENTE'",
            isNullable: false,
            comment: 'PENDENTE, CONFIRMADO, CANCELADO, CONCLUIDO',
          },
          {
            name: 'created_at',
            type: 'timestamp without time zone',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp without time zone',
            default: 'NOW()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign keys para agendamento
    await queryRunner.createForeignKey(
      'agendamento',
      new TableForeignKey({
        columnNames: ['id_servico'],
        referencedColumnNames: ['id_servico'],
        referencedTableName: 'servico',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'agendamento',
      new TableForeignKey({
        columnNames: ['id_usuario'],
        referencedColumnNames: ['id_usuario'],
        referencedTableName: 'usuario',
        onDelete: 'SET NULL',
      }),
    );

    // Inserir tipos de serviço padrão
    await queryRunner.query(`
      INSERT INTO tipo_servico (nome, descricao) VALUES
      ('Manutenção Preventiva', 'Serviços de manutenção regular e preventiva do veículo'),
      ('Manutenção Corretiva', 'Reparos e correções de problemas do veículo'),
      ('Diagnóstico', 'Análise e diagnóstico de problemas'),
      ('Estética Automotiva', 'Serviços de limpeza, polimento e estética'),
      ('Instalação', 'Instalação de acessórios e componentes');
    `);

    // Inserir serviços padrão
    await queryRunner.query(`
      INSERT INTO servico (nome, descricao, preco, duracao_estimada, id_tipo_servico) VALUES
      ('Troca de Óleo', 'Troca de óleo do motor com filtro, verificação de níveis e inspeção visual completa', 150.00, 45, 1),
      ('Alinhamento e Balanceamento', 'Alinhamento computadorizado das rodas e balanceamento completo dos pneus', 120.00, 60, 1),
      ('Revisão de Freios', 'Inspeção completa do sistema de freios, pastilhas, discos e fluido', 200.00, 90, 1),
      ('Troca de Pastilhas de Freio', 'Substituição das pastilhas de freio dianteiras ou traseiras', 280.00, 120, 2),
      ('Troca de Correia Dentada', 'Substituição da correia dentada do motor com verificação de tensionadores', 450.00, 180, 2),
      ('Diagnóstico Computadorizado', 'Análise completa do sistema eletrônico do veículo com scanner automotivo', 80.00, 30, 3),
      ('Troca de Bateria', 'Substituição da bateria com teste do sistema elétrico', 350.00, 30, 2),
      ('Limpeza de Injetores', 'Limpeza profunda dos bicos injetores de combustível', 180.00, 90, 1),
      ('Polimento e Cristalização', 'Polimento completo da pintura com aplicação de cristalizador', 400.00, 240, 4),
      ('Instalação de Som Automotivo', 'Instalação completa de sistema de som com chicotes e conectores', 150.00, 120, 5),
      ('Higienização de Ar-Condicionado', 'Limpeza completa do sistema de ar-condicionado com produtos especializados', 120.00, 60, 1),
      ('Troca de Amortecedores', 'Substituição dos amortecedores dianteiros ou traseiros', 600.00, 180, 2);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign keys
    const agendamentoTable = await queryRunner.getTable('agendamento');
    if (agendamentoTable) {
      const foreignKeys = agendamentoTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('agendamento', fk);
      }
    }

    const servicoTable = await queryRunner.getTable('servico');
    if (servicoTable) {
      const foreignKeys = servicoTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('servico', fk);
      }
    }

    // Remover tabelas
    await queryRunner.dropTable('agendamento', true);
    await queryRunner.dropTable('servico', true);
    await queryRunner.dropTable('tipo_servico', true);
  }
}
