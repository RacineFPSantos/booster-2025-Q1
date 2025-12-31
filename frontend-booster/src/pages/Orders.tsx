import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrderCard } from "@/components/orders/OrderCard";
import { PedidoService } from "@/services/pedidoService";
import { Pedido } from "@/types/pedido.types";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Orders() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      setIsLoading(true);
      const data = await PedidoService.findMyOrders();
      setPedidos(data);
    } catch (error: any) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar seus pedidos");
    } finally {
      setIsLoading(false);
    }
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

          {/* Orders List */}
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
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <OrderCard key={pedido.id_pedido} pedido={pedido} />
              ))}
            </div>
          )}

          {/* Summary */}
          {pedidos.length > 0 && (
            <div className="mt-8 text-center text-sm text-slate-600">
              Total de {pedidos.length}{" "}
              {pedidos.length === 1 ? "pedido" : "pedidos"}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
