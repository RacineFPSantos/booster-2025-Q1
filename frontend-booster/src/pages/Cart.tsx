import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export function Cart() {
  const { cart, removeItem, updateQuantidade, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error("Seu carrinho está vazio!");
      return;
    }
    navigate("/checkout");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
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
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <ShoppingCart className="h-8 w-8" />
                  Meu Carrinho
                </h1>
                <p className="text-slate-600 mt-1">
                  {cart.totalItems === 0
                    ? "Seu carrinho está vazio"
                    : `${cart.totalItems} ${cart.totalItems === 1 ? "item" : "itens"} no carrinho`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="container mx-auto px-4 py-8">
          {cart.items.length === 0 ? (
            // Carrinho vazio
            <div className="text-center py-16">
              <Package className="h-24 w-24 text-slate-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-slate-700 mb-3">
                Seu carrinho está vazio
              </h2>
              <p className="text-slate-500 mb-6">
                Adicione produtos ou serviços para continuar comprando
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/pecas")} size="lg">
                  Ver Peças
                </Button>
                <Button
                  onClick={() => navigate("/servicos")}
                  variant="outline"
                  size="lg"
                >
                  Ver Serviços
                </Button>
              </div>
            </div>
          ) : (
            // Carrinho com items
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Lista de items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Botão limpar carrinho */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Items no carrinho
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar carrinho
                  </Button>
                </div>

                {cart.items.map((item) => {
                  const name = item.produto?.nome;
                  const description = item.produto?.descricao;

                  return (
                    <Card key={item.id_carrinho_item}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Imagem placeholder */}
                          <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-10 w-10 text-slate-400" />
                          </div>

                          {/* Informações */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-1">
                                  {name}
                                </h3>
                                <p className="text-sm text-slate-600 line-clamp-2">
                                  {description}
                                </p>
                                <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                                  Produto
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeItem(item.id_carrinho_item)
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Controles de quantidade e preço */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600">
                                  Quantidade:
                                </span>
                                <div className="flex items-center border rounded-lg">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateQuantidade(
                                        item.id_carrinho_item,
                                        item.quantidade - 1,
                                      )
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="px-4 py-1 text-sm font-medium">
                                    {item.quantidade}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateQuantidade(
                                        item.id_carrinho_item,
                                        item.quantidade + 1,
                                      )
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs text-slate-500">
                                  {formatPrice(item.preco_unitario)} cada
                                </div>
                                <div className="text-lg font-bold text-slate-900">
                                  {formatPrice(item.subtotal)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Resumo do pedido */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">
                      Resumo do Pedido
                    </h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal ({cart.totalItems} itens)</span>
                        <span>{formatPrice(cart.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Frete</span>
                        <span className="text-green-600">Grátis</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold text-slate-900">
                          <span>Total</span>
                          <span>{formatPrice(cart.totalPrice)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      Finalizar Compra
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() => navigate("/pecas")}
                    >
                      Continuar Comprando
                    </Button>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Frete Grátis</strong> para compras acima de R$
                        100,00
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
