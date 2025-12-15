/**
 * Tipos relacionados ao Carrinho de Compras
 */

import { Produto } from "./produto.types";

export interface CartItem {
  id_carrinho_item: number;
  id_carrinho: number;
  id_produto: number;
  quantidade: number;
  preco_unitario: number;
  produto: Produto;
  subtotal: number; // calculado no frontend
}

export interface Cart {
  id_carrinho?: number;
  id_usuario?: number;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addProduto: (produto: Produto, quantidade?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantidade: (itemId: number, quantidade: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  getItemQuantity: (produtoId: number) => number;
}
