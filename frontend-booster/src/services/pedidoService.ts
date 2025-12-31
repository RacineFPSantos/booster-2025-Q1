import { api } from "@/lib/axios";
import type { Pedido, CreatePedidoDto } from "@/types/pedido.types";

/**
 * Serviço de Pedidos
 * Responsável por todas as operações relacionadas a pedidos
 */
export class PedidoService {
  /**
   * Cria um novo pedido
   */
  static async create(pedidoData: CreatePedidoDto): Promise<Pedido> {
    try {
      const response = await api.post<Pedido>("/pedidos", pedidoData);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao criar pedido";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca todos os pedidos do usuário autenticado
   */
  static async findMyOrders(): Promise<Pedido[]> {
    try {
      const response = await api.get<Pedido[]>("/pedidos/my-orders");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao buscar pedidos";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca um pedido específico por ID
   */
  static async findOne(id: number): Promise<Pedido> {
    try {
      const response = await api.get<Pedido>(`/pedidos/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao buscar pedido";
      throw new Error(errorMessage);
    }
  }

  /**
   * Cancela um pedido
   */
  static async cancel(id: number): Promise<void> {
    try {
      await api.patch(`/pedidos/${id}/cancel`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao cancelar pedido";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca todos os pedidos (apenas ADMIN)
   */
  static async findAll(): Promise<Pedido[]> {
    try {
      const response = await api.get<Pedido[]>("/pedidos/admin/all");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao buscar todos os pedidos";
      throw new Error(errorMessage);
    }
  }

  /**
   * Atualiza o status de um pedido (apenas ADMIN)
   */
  static async updateStatus(id: number, status: string): Promise<Pedido> {
    try {
      const response = await api.patch<Pedido>(`/pedidos/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao atualizar status do pedido";
      throw new Error(errorMessage);
    }
  }
}
