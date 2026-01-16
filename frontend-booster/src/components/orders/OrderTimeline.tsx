import { StatusPedidoEnum } from "@/types/pedido.types";
import { Package, CheckCircle, Truck, XCircle, Clock } from "lucide-react";

interface OrderTimelineProps {
  currentStatus: StatusPedidoEnum;
}

const statusOrder = [
  StatusPedidoEnum.PENDENTE,
  StatusPedidoEnum.CONFIRMADO,
  StatusPedidoEnum.ENVIADO,
  StatusPedidoEnum.ENTREGUE,
];

const statusConfig = {
  [StatusPedidoEnum.PENDENTE]: {
    label: "Pendente",
    icon: Clock,
    color: "yellow",
  },
  [StatusPedidoEnum.CONFIRMADO]: {
    label: "Confirmado",
    icon: Package,
    color: "blue",
  },
  [StatusPedidoEnum.ENVIADO]: {
    label: "Enviado",
    icon: Truck,
    color: "purple",
  },
  [StatusPedidoEnum.ENTREGUE]: {
    label: "Entregue",
    icon: CheckCircle,
    color: "green",
  },
  [StatusPedidoEnum.CANCELADO]: {
    label: "Cancelado",
    icon: XCircle,
    color: "red",
  },
};

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  // Se cancelado, mostra apenas o estado de cancelado
  if (currentStatus === StatusPedidoEnum.CANCELADO) {
    const config = statusConfig[StatusPedidoEnum.CANCELADO];
    const Icon = config.icon;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Icon className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-900">Pedido Cancelado</p>
            <p className="text-sm text-red-700">
              Este pedido foi cancelado e não será processado
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {statusOrder.map((status, index) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const isActive = index <= currentIndex;
          const isCurrent = status === currentStatus;

          return (
            <div key={status} className="flex-1 relative">
              {/* Connection line */}
              {index < statusOrder.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${
                    isActive ? `bg-${config.color}-500` : "bg-slate-200"
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? config.color === "yellow"
                        ? "#eab308"
                        : config.color === "blue"
                          ? "#3b82f6"
                          : config.color === "purple"
                            ? "#a855f7"
                            : "#22c55e"
                      : "#e2e8f0",
                  }}
                />
              )}

              {/* Status circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCurrent
                      ? `bg-${config.color}-500 border-${config.color}-500 scale-110`
                      : isActive
                        ? `bg-${config.color}-100 border-${config.color}-500`
                        : "bg-slate-100 border-slate-300"
                  }`}
                  style={{
                    backgroundColor: isCurrent
                      ? config.color === "yellow"
                        ? "#eab308"
                        : config.color === "blue"
                          ? "#3b82f6"
                          : config.color === "purple"
                            ? "#a855f7"
                            : "#22c55e"
                      : isActive
                        ? config.color === "yellow"
                          ? "#fef3c7"
                          : config.color === "blue"
                            ? "#dbeafe"
                            : config.color === "purple"
                              ? "#f3e8ff"
                              : "#dcfce7"
                        : "#f1f5f9",
                    borderColor: isActive
                      ? config.color === "yellow"
                        ? "#eab308"
                        : config.color === "blue"
                          ? "#3b82f6"
                          : config.color === "purple"
                            ? "#a855f7"
                            : "#22c55e"
                      : "#cbd5e1",
                  }}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isCurrent
                        ? "text-white"
                        : isActive
                          ? `text-${config.color}-600`
                          : "text-slate-400"
                    }`}
                    style={{
                      color: isCurrent
                        ? "white"
                        : isActive
                          ? config.color === "yellow"
                            ? "#ca8a04"
                            : config.color === "blue"
                              ? "#2563eb"
                              : config.color === "purple"
                                ? "#9333ea"
                                : "#16a34a"
                          : "#94a3b8",
                    }}
                  />
                </div>

                {/* Label */}
                <p
                  className={`mt-2 text-xs font-medium text-center ${
                    isActive ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  {config.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
