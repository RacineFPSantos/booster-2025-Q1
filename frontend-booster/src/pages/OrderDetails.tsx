import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { PedidoService } from "@/services/pedidoService";
import { Pedido, StatusPedidoEnum } from "@/types/pedido.types";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  ShoppingBag,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadPedido(parseInt(orderId));
    }
  }, [orderId]);

  const loadPedido = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await PedidoService.findOne(id);
      setPedido(data);
    } catch (error: any) {
      console.error("Erro ao carregar pedido:", error);
      toast.error("Erro ao carregar detalhes do pedido");
      navigate("/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!pedido) return;

    try {
      setIsCancelling(true);
      await PedidoService.cancel(pedido.id_pedido);
      toast.success("Pedido cancelado com sucesso");
      // Reload order to get updated status
      await loadPedido(pedido.id_pedido);
      setShowCancelConfirm(false);
    } catch (error: any) {
      console.error("Erro ao cancelar pedido:", error);
      toast.error(error.message || "Erro ao cancelar pedido");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const canCancelOrder = pedido?.status === StatusPedidoEnum.PENDENTE;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Carregando pedido...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Pedido não encontrado</p>
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
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Pedidos
          </Button>

          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Pedido #{pedido.id_pedido.toString().padStart(6, "0")}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(pedido.data_hora)}</span>
                </div>
                <OrderStatusBadge status={pedido.status} />
              </div>
            </div>

            {/* Cancel Confirmation */}
            {showCancelConfirm && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Cancelar Pedido?
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Tem certeza que deseja cancelar este pedido? Esta ação
                        não pode ser desfeita.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="destructive"
                          onClick={handleCancelOrder}
                          disabled={isCancelling}
                        >
                          {isCancelling && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          Sim, Cancelar Pedido
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCancelConfirm(false)}
                          disabled={isCancelling}
                        >
                          Não, Manter Pedido
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Resumo do Pedido
                </h2>

                <div className="space-y-4">
                  {/* Items */}
                  {pedido.items && pedido.items.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                        <ShoppingBag className="h-4 w-4" />
                        <span>Itens do Pedido</span>
                      </div>
                      <div className="space-y-3">
                        {pedido.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-start p-4 bg-slate-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 mb-1">
                                {item.id_produto
                                  ? `Produto #${item.id_produto}`
                                  : `Serviço #${item.id_servico}`}
                              </p>
                              <p className="text-sm text-slate-600">
                                Quantidade: {item.quantidade}x{" "}
                                {formatPrice(item.preco_unitario)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">
                                {formatPrice(
                                  item.preco_unitario * item.quantidade,
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900">
                        Valor Total
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(pedido.valor_total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Status do Pedido
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
                        pedido.status === StatusPedidoEnum.CANCELADO
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {pedido.status === StatusPedidoEnum.PENDENTE &&
                          "Pedido Recebido"}
                        {pedido.status === StatusPedidoEnum.CONFIRMADO &&
                          "Pedido Confirmado"}
                        {pedido.status === StatusPedidoEnum.ENVIADO &&
                          "Pedido Enviado"}
                        {pedido.status === StatusPedidoEnum.ENTREGUE &&
                          "Pedido Entregue"}
                        {pedido.status === StatusPedidoEnum.CANCELADO &&
                          "Pedido Cancelado"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDate(pedido.data_hora)}
                      </p>
                    </div>
                  </div>

                  {pedido.status !== StatusPedidoEnum.CANCELADO && (
                    <>
                      {pedido.status === StatusPedidoEnum.PENDENTE && (
                        <div className="text-sm text-slate-600 pl-7">
                          Aguardando confirmação da equipe
                        </div>
                      )}
                      {pedido.status === StatusPedidoEnum.CONFIRMADO && (
                        <div className="text-sm text-slate-600 pl-7">
                          Seu pedido está sendo preparado para envio
                        </div>
                      )}
                      {pedido.status === StatusPedidoEnum.ENVIADO && (
                        <div className="text-sm text-slate-600 pl-7">
                          Seu pedido está a caminho
                        </div>
                      )}
                      {pedido.status === StatusPedidoEnum.ENTREGUE && (
                        <div className="text-sm text-slate-600 pl-7">
                          Pedido entregue com sucesso!
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/orders")}
              >
                Voltar aos Pedidos
              </Button>
              {canCancelOrder && !showCancelConfirm && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Pedido
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
