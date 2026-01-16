import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PedidoService } from "@/services/pedidoService";
import { StatusPedidoSelect } from "@/components/admin/StatusPedidoSelect";
import type { Pedido } from "@/types/pedido.types";
import { Search, Eye, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminPedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("");

  useEffect(() => {
    loadPedidos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [busca, statusFiltro, pedidos]);

  const loadPedidos = async () => {
    try {
      setIsLoading(true);
      const data = await PedidoService.findAll();
      setPedidos(data);
      setPedidosFiltrados(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...pedidos];

    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.id_pedido.toString().includes(buscaLower) ||
          p.usuario?.nome?.toLowerCase().includes(buscaLower),
      );
    }

    if (statusFiltro) {
      resultado = resultado.filter((p) => p.status === statusFiltro);
    }

    setPedidosFiltrados(resultado);
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      return format(date, "dd/MM/yyyy HH:mm", {
        locale: ptBR,
      });
    } catch {
      return typeof dateString === "string"
        ? dateString
        : dateString.toLocaleString();
    }
  };

  const getStatusStats = () => {
    return {
      total: pedidos.length,
      pendente: pedidos.filter((p) => p.status === "PENDENTE").length,
      confirmado: pedidos.filter((p) => p.status === "CONFIRMADO").length,
      enviado: pedidos.filter((p) => p.status === "ENVIADO").length,
      entregue: pedidos.filter((p) => p.status === "ENTREGUE").length,
      cancelado: pedidos.filter((p) => p.status === "CANCELADO").length,
    };
  };

  const stats = getStatusStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Carregando pedidos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gestão de Pedidos
          </h1>
          <p className="text-slate-600 mt-1">
            Gerencie todos os pedidos do sistema
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-yellow-600">Pendente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pendente}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-blue-600">Confirmado</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.confirmado}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-purple-600">Enviado</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.enviado}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-green-600">Entregue</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.entregue}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-red-600">Cancelado</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.cancelado}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por ID ou cliente..."
                  className="pl-10"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos ({pedidosFiltrados.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pedidosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-slate-500">
                  {busca || statusFiltro
                    ? "Tente ajustar os filtros"
                    : "Não há pedidos no sistema"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-slate-700">
                        ID
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Cliente
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Data
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Valor
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="text-right p-4 font-semibold text-slate-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFiltrados.map((pedido) => {
                      return (
                        <tr
                          key={pedido.id_pedido}
                          className="border-b hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4">
                            <span className="font-mono text-sm font-medium text-slate-900">
                              #{pedido.id_pedido}
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {pedido.usuario?.nome || "Cliente"}
                              </p>
                              {pedido.usuario?.email && (
                                <p className="text-sm text-slate-500">
                                  {pedido.usuario.email}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">
                            {formatDate(pedido.data_hora)}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-900">
                              R$ {Number(pedido.valor_total || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4">
                            <StatusPedidoSelect
                              pedidoId={pedido.id_pedido}
                              statusAtual={pedido.status}
                              onStatusChange={loadPedidos}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() =>
                                  navigate(`/orders/${pedido.id_pedido}`)
                                }
                              >
                                <Eye className="h-4 w-4" />
                                Ver Detalhes
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
