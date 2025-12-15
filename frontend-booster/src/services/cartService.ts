import { api } from "@/lib/axios";

export interface CartItemResponse {
  id_carrinho_item: number;
  id_carrinho: number;
  id_produto: number;
  quantidade: number;
  preco_unitario: number;
  produto: {
    id_produto: number;
    nome: string;
    descricao: string;
    preco_unitario: number;
  };
}

export interface CartResponse {
  id_carrinho: number;
  id_usuario: number;
  items: CartItemResponse[];
  totalItems: number;
  totalPrice: number;
  created_at: Date;
  updated_at: Date;
}

export interface AddToCartDto {
  id_produto: number;
  quantidade: number;
}

export interface UpdateCartItemDto {
  quantidade: number;
}

/**
 * Serviço de Carrinho
 * Responsável por todas as operações relacionadas ao carrinho
 */
export class CartService {
  /**
   * Busca o carrinho do usuário autenticado
   */
  static async getCart(): Promise<CartResponse> {
    try {
      const response = await api.get<CartResponse>("/cart");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao buscar carrinho";
      throw new Error(errorMessage);
    }
  }

  /**
   * Adiciona um produto ao carrinho
   */
  static async addToCart(data: AddToCartDto): Promise<CartResponse> {
    try {
      const response = await api.post<CartResponse>("/cart", data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao adicionar ao carrinho";
      throw new Error(errorMessage);
    }
  }

  /**
   * Atualiza a quantidade de um item
   */
  static async updateCartItem(
    itemId: number,
    data: UpdateCartItemDto
  ): Promise<CartResponse> {
    try {
      const response = await api.patch<CartResponse>(
        `/cart/items/${itemId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao atualizar item";
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove um item do carrinho
   */
  static async removeCartItem(itemId: number): Promise<CartResponse> {
    try {
      const response = await api.delete<CartResponse>(`/cart/items/${itemId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao remover item";
      throw new Error(errorMessage);
    }
  }

  /**
   * Limpa todo o carrinho
   */
  static async clearCart(): Promise<void> {
    try {
      await api.delete("/cart");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao limpar carrinho";
      throw new Error(errorMessage);
    }
  }
}
