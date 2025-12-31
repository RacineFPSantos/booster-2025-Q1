/**
 * Tipos relacionados a Pedidos
 */

export enum StatusPedidoEnum {
  PENDENTE = "PENDENTE",
  CONFIRMADO = "CONFIRMADO",
  ENVIADO = "ENVIADO",
  ENTREGUE = "ENTREGUE",
  CANCELADO = "CANCELADO",
}

export interface PedidoItem {
  id_pedido_item?: number;
  id_pedido?: number;
  id_produto?: number;
  id_servico?: number;
  quantidade: number;
  preco_unitario: number;
}

export interface Pedido {
  id_pedido: number;
  id_cliente: number;
  data_hora: Date | string;
  valor_total: number;
  status: StatusPedidoEnum;
  id_usuario: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  items?: PedidoItem[];
  cliente?: {
    nome?: string;
    email?: string;
  };
}

export interface CreatePedidoDto {
  items: {
    id_produto?: number;
    id_servico?: number;
    quantidade: number;
    preco_unitario: number;
  }[];
}

export interface CheckoutData {
  // Dados do pedido serão criados a partir do carrinho
  observacoes?: string;
}
