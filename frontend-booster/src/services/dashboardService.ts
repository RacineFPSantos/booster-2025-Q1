import { api } from "@/lib/axios";

export interface DashboardStats {
  sales: {
    total: number;
    change: number;
  };
  orders: {
    total: number;
    change: number;
  };
  products: {
    total: number;
    change: number;
  };
  clients: {
    total: number;
    change: number;
  };
}

export interface RecentOrder {
  id_pedido: number;
  id_cliente: number;
  valor_total: number;
  status: string;
  data_hora: string;
  cliente?: {
    nome?: string;
    email?: string;
  };
}

export interface LowStockProduct {
  id_produto: number;
  nome: string;
  quantidade: number;
  minimo: number;
}

/**
 * Serviço de Dashboard
 * Responsável por operações do dashboard administrativo
 */
export class DashboardService {
  /**
   * Busca estatísticas gerais do sistema
   */
  static async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<DashboardStats>("/dashboard/stats");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao buscar estatísticas";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca pedidos recentes
   */
  static async getRecentOrders(): Promise<RecentOrder[]> {
    try {
      const response = await api.get<RecentOrder[]>("/dashboard/recent-orders");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao buscar pedidos recentes";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca produtos com estoque baixo
   */
  static async getLowStockProducts(): Promise<LowStockProduct[]> {
    try {
      const response = await api.get<LowStockProduct[]>("/dashboard/low-stock");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao buscar produtos com estoque baixo";
      throw new Error(errorMessage);
    }
  }
}
