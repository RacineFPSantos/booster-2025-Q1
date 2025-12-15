import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PedidoService } from "@/services/pedidoService";
import {
  ShoppingBag,
  CreditCard,
  MapPin,
  User,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function Checkout() {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  // Redirecionar se não estiver autenticado
  if (!isAuthenticated) {
    toast.error("Você precisa estar logado para finalizar a compra");
    navigate("/");
    return null;
  }

  // Redirecionar se carrinho estiver vazio
  if (cart.items.length === 0) {
    toast.info("Seu carrinho está vazio");
    navigate("/cart");
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleFinalizarPedido = async () => {
    setIsProcessing(true);

    try {
      // Preparar dados do pedido
      const pedidoData = {
        items: cart.items.map((item) => ({
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: Number(item.preco_unitario),
        })),
      };

      // Criar pedido
      const pedido = await PedidoService.create(pedidoData);

      // Limpar carrinho
      clearCart();

      // Redirecionar para página de confirmação
      toast.success("Pedido realizado com sucesso!");
      navigate(`/order-confirmation/${pedido.id_pedido}`);
    } catch (error: any) {
      console.error("Erro ao finalizar pedido:", error);
      toast.error(error.message || "Erro ao processar pedido");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/cart")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Carrinho
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8" />
                  Finalizar Compra
                </h1>
                <p className="text-slate-600 mt-1">
                  Revise seus dados e finalize seu pedido
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Informações do pedido */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados do Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-slate-600">Nome</Label>
                    <p className="font-medium">{user?.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Email</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço de Entrega */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    O endereço será solicitado após a confirmação do pedido
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Frete Grátis</strong> para sua região!
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Entrega em até 5 dias úteis
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Forma de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            Pagamento na Entrega
                          </p>
                          <p className="text-sm text-slate-600">
                            Pague com cartão, dinheiro ou Pix
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      * Outras formas de pagamento serão disponibilizadas em
                      breve
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações (Opcional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Adicione observações sobre seu pedido..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.items.map((item) => {
                      const name = item.produto?.nome;

                      return (
                        <div
                          key={item.id_carrinho_item}
                          className="flex justify-between text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{name}</p>
                            <p className="text-slate-500">
                              {item.quantidade}x{" "}
                              {formatPrice(item.preco_unitario)}
                            </p>
                          </div>
                          <p className="font-medium text-slate-900">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({cart.totalItems} itens)</span>
                      <span>{formatPrice(cart.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Frete</span>
                      <span className="text-green-600 font-medium">Grátis</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold text-slate-900">
                        <span>Total</span>
                        <span>{formatPrice(cart.totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleFinalizarPedido}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar Pedido
                      </>
                    )}
                  </Button>

                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                    <p className="font-medium mb-1">Segurança</p>
                    <p className="text-xs">
                      Seus dados estão protegidos e sua compra é 100% segura
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
