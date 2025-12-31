import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PedidoService } from "@/services/pedidoService";
import { toast } from "sonner";

interface StatusPedidoSelectProps {
  pedidoId: number;
  statusAtual: string;
  onStatusChange: () => void;
}

export function StatusPedidoSelect({
  pedidoId,
  statusAtual,
  onStatusChange,
}: StatusPedidoSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "CONFIRMADO", label: "Confirmado" },
    { value: "ENVIADO", label: "Enviado" },
    { value: "ENTREGUE", label: "Entregue" },
    { value: "CANCELADO", label: "Cancelado" },
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === statusAtual) return;

    setIsUpdating(true);
    try {
      await PedidoService.updateStatus(pedidoId, newStatus);
      toast.success("Status do pedido atualizado com sucesso");
      onStatusChange();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do pedido");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={statusAtual}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
