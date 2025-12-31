import { StatusPedidoEnum } from "@/types/pedido.types";
import { Package, CheckCircle, Truck, XCircle, Clock } from "lucide-react";

interface OrderStatusBadgeProps {
  status: StatusPedidoEnum;
  showIcon?: boolean;
}

const statusConfig = {
  [StatusPedidoEnum.PENDENTE]: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  [StatusPedidoEnum.CONFIRMADO]: {
    label: "Confirmado",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
  },
  [StatusPedidoEnum.ENVIADO]: {
    label: "Enviado",
    className: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Truck,
  },
  [StatusPedidoEnum.ENTREGUE]: {
    label: "Entregue",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  [StatusPedidoEnum.CANCELADO]: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

export function OrderStatusBadge({
  status,
  showIcon = true,
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </span>
  );
}
