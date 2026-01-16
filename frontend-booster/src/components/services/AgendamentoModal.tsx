import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Servico } from "@/types/servico.types";
import { Calendar, Clock, User, Phone, Car } from "lucide-react";

interface AgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servico: Servico | null;
  onConfirm: (data: AgendamentoData) => Promise<void>;
}

export interface AgendamentoData {
  id_servico: number;
  data_agendamento: string;
  hora_agendamento: string;
  nome_cliente: string;
  telefone: string;
  veiculo: string;
  observacoes?: string;
}

export function AgendamentoModal({
  open,
  onOpenChange,
  servico,
  onConfirm,
}: AgendamentoModalProps) {
  const [formData, setFormData] = useState({
    data: "",
    hora: "",
    nome: "",
    telefone: "",
    veiculo: "",
    observacoes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!servico) return;

    // Validações
    if (!formData.data || !formData.hora) {
      alert("Por favor, selecione data e hora para o agendamento");
      return;
    }

    if (!formData.nome || formData.nome.length < 3) {
      alert("Por favor, informe seu nome completo");
      return;
    }

    if (!formData.telefone || formData.telefone.length < 10) {
      alert("Por favor, informe um telefone válido");
      return;
    }

    if (!formData.veiculo || formData.veiculo.length < 3) {
      alert("Por favor, informe o modelo do veículo");
      return;
    }

    setIsSubmitting(true);

    try {
      const agendamentoData: AgendamentoData = {
        id_servico: servico.id_servico,
        data_agendamento: formData.data,
        hora_agendamento: formData.hora,
        nome_cliente: formData.nome,
        telefone: formData.telefone,
        veiculo: formData.veiculo,
        observacoes: formData.observacoes,
      };

      await onConfirm(agendamentoData);

      // Limpar form
      setFormData({
        data: "",
        hora: "",
        nome: "",
        telefone: "",
        veiculo: "",
        observacoes: "",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao agendar serviço:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Data mínima (hoje)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Serviço</DialogTitle>
        </DialogHeader>

        {servico && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-1">{servico.nome}</h3>
            <p className="text-sm text-blue-700 mb-2">{servico.descricao}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600">
                <Clock className="inline h-3 w-3 mr-1" />
                {servico.duracao_estimada} min
              </span>
              <span className="font-bold text-blue-900">
                R$ {Number(servico.preco).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data *
              </Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
                min={today}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">
                <Clock className="inline h-4 w-4 mr-1" />
                Hora *
              </Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) =>
                  setFormData({ ...formData, hora: e.target.value })
                }
                min="08:00"
                max="18:00"
                required
              />
              <p className="text-xs text-slate-500">
                Horário de atendimento: 8h às 18h
              </p>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">
              <User className="inline h-4 w-4 mr-1" />
              Nome Completo *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Seu nome completo"
              required
              minLength={3}
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">
              <Phone className="inline h-4 w-4 mr-1" />
              Telefone *
            </Label>
            <Input
              id="telefone"
              type="tel"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
              placeholder="(00) 00000-0000"
              required
              minLength={10}
            />
          </div>

          {/* Veículo */}
          <div className="space-y-2">
            <Label htmlFor="veiculo">
              <Car className="inline h-4 w-4 mr-1" />
              Veículo *
            </Label>
            <Input
              id="veiculo"
              value={formData.veiculo}
              onChange={(e) =>
                setFormData({ ...formData, veiculo: e.target.value })
              }
              placeholder="Ex: Honda Civic 2020"
              required
              minLength={3}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Alguma informação adicional sobre o serviço ou veículo"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
