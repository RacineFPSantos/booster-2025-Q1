import { Pedido } from "@/types/pedido.types";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrderCardProps {
  pedido: Pedido;
}

export function OrderCard({ pedido }: OrderCardProps) {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const itemCount = pedido.items?.length || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left side - Order info */}
          <div className="flex-1 space-y-3">
            {/* Order number and date */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Pedido #{pedido.id_pedido.toString().padStart(6, "0")}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(pedido.data_hora)}</span>
              </div>
            </div>

            {/* Items count and total */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-slate-600">
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {itemCount} {itemCount === 1 ? "item" : "itens"}
                </span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(pedido.valor_total)}
              </div>
            </div>

            {/* Status badge */}
            <div>
              <OrderStatusBadge status={pedido.status} />
            </div>
          </div>

          {/* Right side - Action button */}
          <div>
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => navigate(`/orders/${pedido.id_pedido}`)}
            >
              Ver Detalhes
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
