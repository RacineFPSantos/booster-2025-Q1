import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateChatTables1767801648414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar Tabela de Rooms
    await queryRunner.createTable(
      new Table({
        name: 'rooms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'customer_id', type: 'varchar' },
          { name: 'admin_id', type: 'varchar', isNullable: true },
          { name: 'status', type: 'varchar', default: "'waiting'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );

    // Criar Tabela de Messages
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'room_id', type: 'uuid' },
          { name: 'sender_id', type: 'varchar' },
          { name: 'content', type: 'text' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );

    // Adicionar a Chave Estrangeira
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['room_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'rooms',
        onDelete: 'CASCADE',
      }),
    );

    // ATENÇÃO: Habilitar o Realtime via Migration (Comando SQL direto)
    await queryRunner.query(
      `ALTER PUBLICATION supabase_realtime ADD TABLE rooms;`,
    );
    await queryRunner.query(
      `ALTER PUBLICATION supabase_realtime ADD TABLE messages;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('messages');
    await queryRunner.dropTable('rooms');
  }
}
