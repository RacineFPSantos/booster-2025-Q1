import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PedidoService } from "@/services/pedidoService";
import type { Pedido } from "@/types/pedido.types";
import {
  CheckCircle,
  Package,
  Loader2,
  Home,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

export function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      navigate("/");
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Pedido Confirmado!
              </h1>
              <p className="text-slate-600">
                Seu pedido foi recebido e está sendo processado
              </p>
            </div>

            {/* Order Details */}
            {pedido && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Order Number */}
                    <div className="pb-4 border-b">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">
                            Número do Pedido
                          </p>
                          <p className="text-2xl font-bold text-slate-900">
                            #{pedido.id_pedido.toString().padStart(6, "0")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600 mb-1">Data</p>
                          <p className="font-medium text-slate-900">
                            {formatDate(pedido.data_hora)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">
                          Status: {pedido.status}
                        </p>
                        <p className="text-sm text-slate-600">
                          Entraremos em contato em breve
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-slate-900">
                          Valor Total
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(pedido.valor_total)}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    {pedido.items && pedido.items.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="font-medium text-slate-900 mb-3">
                          Itens do Pedido
                        </p>
                        <div className="space-y-2">
                          {pedido.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-slate-600">
                                {item.quantidade}x{" "}
                                {item.id_produto ? "Produto" : "Serviço"} #
                                {item.id_produto || item.id_servico}
                              </span>
                              <span className="font-medium text-slate-900">
                                {formatPrice(
                                  item.preco_unitario * item.quantidade
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Information */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Próximos Passos
                </h3>
                <ol className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600 min-w-[20px]">
                      1.
                    </span>
                    <span>
                      Você receberá um e-mail de confirmação com os detalhes do
                      pedido
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600 min-w-[20px]">
                      2.
                    </span>
                    <span>
                      Nossa equipe entrará em contato para confirmar o endereço
                      de entrega
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600 min-w-[20px]">
                      3.
                    </span>
                    <span>
                      Seu pedido será processado e enviado em até 2 dias úteis
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600 min-w-[20px]">
                      4.
                    </span>
                    <span>
                      Acompanhe o status do seu pedido através do nosso sistema
                    </span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1"
                size="lg"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                size="lg"
                onClick={() => navigate("/pecas")}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continuar Comprando
              </Button>
            </div>

            {/* Support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Dúvidas sobre seu pedido?{" "}
                <a
                  href="#contato"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Entre em contato conosco
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
