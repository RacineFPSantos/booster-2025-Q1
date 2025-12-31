import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  DashboardService,
  type DashboardStats,
  type RecentOrder,
  type LowStockProduct,
} from "@/services/dashboardService";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, ordersData, lowStockData] = await Promise.all([
        DashboardService.getStats(),
        DashboardService.getRecentOrders(),
        DashboardService.getLowStockProducts(),
      ]);

      setStats(statsData);
      setRecentOrders(ordersData);
      setLowStockProducts(lowStockData);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return date;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: "bg-yellow-100 text-yellow-800",
      CONFIRMADO: "bg-blue-100 text-blue-800",
      ENVIADO: "bg-purple-100 text-purple-800",
      ENTREGUE: "bg-green-100 text-green-800",
      CANCELADO: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDENTE: "Pendente",
      CONFIRMADO: "Confirmado",
      ENVIADO: "Enviado",
      ENTREGUE: "Entregue",
      CANCELADO: "Cancelado",
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Carregando dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statsCards = [
    {
      title: "Vendas Totais",
      value: formatPrice(stats?.sales.total || 0),
      change: stats?.sales.change || 0,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pedidos",
      value: stats?.orders.total.toString() || "0",
      change: stats?.orders.change || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Produtos",
      value: stats?.products.total.toString() || "0",
      change: stats?.products.change || 0,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Clientes",
      value: stats?.clients.total.toString() || "0",
      change: stats?.clients.change || 0,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Visão geral do sistema de gerenciamento
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.change >= 0;
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;
            const trendColor = isPositive ? "text-green-600" : "text-red-600";

            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {stat.value}
                      </p>
                      {stat.change !== 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                          <span className={`text-sm font-medium ${trendColor}`}>
                            {isPositive ? "+" : ""}
                            {stat.change.toFixed(1)}%
                          </span>
                          <span className="text-sm text-slate-500">
                            vs mês anterior
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Nenhum pedido encontrado
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id_pedido}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-slate-900">
                            #{order.id_pedido.toString().padStart(6, "0")}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {order.cliente?.nome || "Cliente"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {formatPrice(order.valor_total)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(order.data_hora)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Todos os produtos com estoque adequado
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id_produto}
                      className="p-3 border border-orange-200 bg-orange-50 rounded-lg"
                    >
                      <p className="font-medium text-slate-900">
                        {product.nome}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-600">
                          Estoque: {product.quantidade}
                        </span>
                        <span className="text-sm text-orange-600 font-medium">
                          Mín: {product.minimo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
