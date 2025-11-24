import { Servico } from "@/types/servico.types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Wrench } from "lucide-react";

interface ServicoCardProps {
  servico: Servico;
  onAgendar?: (servico: Servico) => void;
}

export function ServicoCard({ servico, onAgendar }: ServicoCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="bg-gradient-to-br from-green-50 to-slate-50 p-6 flex items-center justify-center h-48">
        <Wrench className="h-20 w-20 text-slate-300" />
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {servico.nome}
        </h3>

        <p className="text-sm text-slate-600 mb-3 line-clamp-3 min-h-[3.75rem]">
          {servico.descricao}
        </p>

        <div className="space-y-2 text-sm">
          {servico.tipo_servico && (
            <div className="flex items-center gap-2 text-slate-500">
              <Wrench className="h-4 w-4" />
              <span>{servico.tipo_servico.nome}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="h-4 w-4" />
            <span>Duração: {formatDuration(servico.duracao_estimada)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-green-600">
            {formatPrice(servico.preco)}
          </p>
          <p className="text-xs text-slate-500">Valor do serviço</p>
        </div>

        {onAgendar && (
          <Button
            onClick={() => onAgendar(servico)}
            className="gap-2 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Calendar className="h-4 w-4" />
            Agendar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
