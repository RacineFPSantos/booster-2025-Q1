import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAiInteractionLog1770000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ai_interaction_log',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'user_id', type: 'int', isNullable: true },
          { name: 'session_id', type: 'varchar', length: '100', isNullable: true },
          { name: 'prompt_text', type: 'text' },
          { name: 'system_prompt_version', type: 'varchar', length: '20' },
          { name: 'response_text', type: 'text' },
          { name: 'intent_detected', type: 'varchar', length: '50', isNullable: true },
          { name: 'input_tokens', type: 'int', isNullable: true },
          { name: 'output_tokens', type: 'int', isNullable: true },
          { name: 'total_tokens', type: 'int', isNullable: true },
          { name: 'model_used', type: 'varchar', length: '100' },
          { name: 'latency_ms', type: 'int' },
          { name: 'was_filtered', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'ai_interaction_log',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id_usuario'],
        referencedTableName: 'usuario',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ai_interaction_log', true);
  }
}
