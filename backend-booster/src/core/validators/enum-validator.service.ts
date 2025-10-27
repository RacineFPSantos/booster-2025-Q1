import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  TIPO_CLIENTE_VALUES,
  STATUS_PEDIDO_VALUES,
} from '../../shared/enums/database.enums';

@Injectable()
export class EnumValidatorService implements OnModuleInit {
  private readonly logger = new Logger(EnumValidatorService.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async onModuleInit() {
    await this.validateTipoClienteEnum();
    await this.validateStatusPedidoEnum();
  }

  private async validateTipoClienteEnum() {
    // Valores definidos no código (agora vem do enum centralizado)
    const codeValues = TIPO_CLIENTE_VALUES;

    // Buscar valores do banco de dados
    const result = await this.entityManager.query(`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = 'tipo_cliente_enum'::regtype
      ORDER BY enumlabel;
    `);

    const dbValues: string[] = result.map((row: any) => row.enumlabel);

    // Verificar se há valores no banco que não estão no código
    const missingInCode = dbValues.filter(
      (value) => !codeValues.map(String).includes(value),
    );

    // Verificar se há valores no código que não estão no banco
    const missingInDb = codeValues.filter((value) => !dbValues.includes(value));

    if (missingInCode.length > 0) {
      this.logger.warn(
        `⚠️  ATENÇÃO: O enum 'tipo_cliente_enum' no banco possui valores que não estão no código TypeScript: ${missingInCode.join(', ')}`,
      );
      this.logger.warn(
        `Por favor, atualize o type TipoCliente em src/cliente/entities/cliente.entity.ts`,
      );
    }

    if (missingInDb.length > 0) {
      this.logger.warn(
        `⚠️  ATENÇÃO: O código TypeScript possui valores que não estão no enum do banco: ${missingInDb.join(', ')}`,
      );
    }

    if (missingInCode.length === 0 && missingInDb.length === 0) {
      this.logger.log(
        `✅ Enum 'tipo_cliente_enum' está sincronizado entre código e banco de dados`,
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
      this.logger.warn(
        `Por favor, atualize o StatusPedidoEnum em src/common/enums/database.enums.ts`,
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
