/**
 * Enums do banco de dados - FONTE ÚNICA DA VERDADE
 *
 * IMPORTANTE: Quando adicionar/remover valores:
 * 1. Atualizar este arquivo
 * 2. Criar uma migration para alterar o enum no banco
 * 3. Executar: npm run migration:run
 */

export enum TipoClienteEnum {
  PF = 'PF',
  PJ = 'PJ',
}

export enum StatusPedidoEnum {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

// Helpers para usar nas migrations
export const TIPO_CLIENTE_VALUES = Object.values(TipoClienteEnum);
export const STATUS_PEDIDO_VALUES = Object.values(StatusPedidoEnum);
export const USER_ROLE_VALUES = Object.values(UserRole);
