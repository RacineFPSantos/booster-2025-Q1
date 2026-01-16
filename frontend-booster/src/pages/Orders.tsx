import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrderCard } from "@/components/orders/OrderCard";
import { PedidoService } from "@/services/pedidoService";
import { Pedido, StatusPedidoEnum } from "@/types/pedido.types";
import {
  Loader2,
  Package,
  ShoppingBag,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Orders() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFiltro, setStatusFiltro] = useState<string>("");

  useEffect(() => {
    loadPedidos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [statusFiltro, pedidos]);

  const loadPedidos = async () => {
    try {
      setIsLoading(true);
      const data = await PedidoService.findMyOrders();
      setPedidos(data);
      setPedidosFiltrados(data);
    } catch (error: any) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar seus pedidos");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    if (!statusFiltro) {
      setPedidosFiltrados(pedidos);
      return;
    }

    const filtrados = pedidos.filter((p) => p.status === statusFiltro);
    setPedidosFiltrados(filtrados);
  };

  const getStatusCount = (status: StatusPedidoEnum) => {
    return pedidos.filter((p) => p.status === status).length;
  };

  const getTotalValue = () => {
    return pedidos.reduce((sum, p) => sum + Number(p.valor_total || 0), 0);
  };

  const limparFiltros = () => {
    setStatusFiltro("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Carregando seus pedidos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">
                Meus Pedidos
              </h1>
            </div>
            <p className="text-slate-600">
              Acompanhe o histórico e status dos seus pedidos
            </p>
          </div>

          {pedidos.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Nenhum pedido encontrado
              </h2>
              <p className="text-slate-600 mb-6">
                Você ainda não fez nenhum pedido. Que tal começar agora?
              </p>
              <Button size="lg" onClick={() => navigate("/pecas")}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Explorar Produtos
              </Button>
            </div>
          ) : (
            <>
              {/* Estatísticas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Pedidos
                    </CardTitle>
                    <Package className="h-4 w-4 text-slate-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pedidos.length}</div>
                    <p className="text-xs text-slate-500 mt-1">
                      R${" "}
                      {getTotalValue().toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pendentes
                    </CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getStatusCount(StatusPedidoEnum.PENDENTE)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Confirmados
                    </CardTitle>
                    <Package className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getStatusCount(StatusPedidoEnum.CONFIRMADO)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Em Trânsito
                    </CardTitle>
                    <Truck className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getStatusCount(StatusPedidoEnum.ENVIADO)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Entregues
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getStatusCount(StatusPedidoEnum.ENTREGUE)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Filter className="h-4 w-4" />
                      Filtrar por status:
                    </div>

                    <div className="flex flex-wrap gap-2 flex-1">
                      <Button
                        variant={!statusFiltro ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFiltro("")}
                      >
                        Todos
                      </Button>
                      <Button
                        variant={
                          statusFiltro === StatusPedidoEnum.PENDENTE
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setStatusFiltro(StatusPedidoEnum.PENDENTE)
                        }
                        className={
                          statusFiltro === StatusPedidoEnum.PENDENTE
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : ""
                        }
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Pendentes
                      </Button>
                      <Button
                        variant={
                          statusFiltro === StatusPedidoEnum.CONFIRMADO
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setStatusFiltro(StatusPedidoEnum.CONFIRMADO)
                        }
                        className={
                          statusFiltro === StatusPedidoEnum.CONFIRMADO
                            ? "bg-blue-600 hover:bg-blue-700"
                            : ""
                        }
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Confirmados
                      </Button>
                      <Button
                        variant={
                          statusFiltro === StatusPedidoEnum.ENVIADO
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setStatusFiltro(StatusPedidoEnum.ENVIADO)
                        }
                        className={
                          statusFiltro === StatusPedidoEnum.ENVIADO
                            ? "bg-purple-600 hover:bg-purple-700"
                            : ""
                        }
                      >
                        <Truck className="h-3 w-3 mr-1" />
                        Em Trânsito
                      </Button>
                      <Button
                        variant={
                          statusFiltro === StatusPedidoEnum.ENTREGUE
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setStatusFiltro(StatusPedidoEnum.ENTREGUE)
                        }
                        className={
                          statusFiltro === StatusPedidoEnum.ENTREGUE
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Entregues
                      </Button>
                      <Button
                        variant={
                          statusFiltro === StatusPedidoEnum.CANCELADO
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setStatusFiltro(StatusPedidoEnum.CANCELADO)
                        }
                        className={
                          statusFiltro === StatusPedidoEnum.CANCELADO
                            ? "bg-red-600 hover:bg-red-700"
                            : ""
                        }
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelados
                      </Button>
                    </div>

                    {statusFiltro && (
                      <Button variant="ghost" size="sm" onClick={limparFiltros}>
                        Limpar
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 text-sm text-slate-600">
                    {pedidosFiltrados.length === 0 ? (
                      <span>Nenhum pedido encontrado com este status</span>
                    ) : (
                      <span>
                        Mostrando {pedidosFiltrados.length} de {pedidos.length}{" "}
                        {pedidos.length === 1 ? "pedido" : "pedidos"}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Orders List */}
              <div className="space-y-4">
                {pedidosFiltrados.map((pedido) => (
                  <OrderCard key={pedido.id_pedido} pedido={pedido} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
