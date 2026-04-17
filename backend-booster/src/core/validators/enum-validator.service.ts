import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { STATUS_PEDIDO_VALUES } from '../../shared/enums/database.enums';

@Injectable()
export class EnumValidatorService implements OnModuleInit {
  private readonly logger = new Logger(EnumValidatorService.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async onModuleInit() {
    try {
      await this.validateStatusPedidoEnum();
    } catch (error) {
      this.logger.error(
        'Falha ao validar enums do banco de dados (nÃ£o-crÃ­tico):',
        error,
      );
    }
  }

  private async validateStatusPedidoEnum() {
    const codeValues = STATUS_PEDIDO_VALUES;

    const result = await this.entityManager.query(`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = 'status_pedido_enum'::regtype
      ORDER BY enumlabel;
    `);

    const dbValues: string[] = result.map((row: any) => row.enumlabel);

    const missingInCode = dbValues.filter(
      (value) => !codeValues.map(String).includes(value),
    );

    const missingInDb = codeValues.filter((value) => !dbValues.includes(value));

    if (missingInCode.length > 0) {
      this.logger.warn(
        `⚠️  ATENÇÃO: O enum 'status_pedido_enum' no banco possui valores que não estão no código TypeScript: ${missingInCode.join(', ')}`,
      );
    }

    if (missingInDb.length > 0) {
      this.logger.warn(
        `⚠️  ATENÇÃO: O código TypeScript possui valores que não estão no enum do banco: ${missingInDb.join(', ')}`,
      );
    }

    if (missingInCode.length === 0 && missingInDb.length === 0) {
      this.logger.log(
        `✅ Enum 'status_pedido_enum' está sincronizado entre código e banco de dados`,
      );
    }
  }
}
