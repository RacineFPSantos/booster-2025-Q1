import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { StatsSection } from "./StatsSection";

export function HeroSection() {
  const stats = [
    { value: "15k+", label: "Peças" },
    { value: "8k+", label: "Clientes" },
    { value: "99%", label: "Satisfação" },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight">
            Peças e Serviços para o seu
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              veículo
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Peças originais, serviços especializados e oficina completa. Tudo
            que seu carro precisa em um só lugar
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar peças, serviços ou categoria..."
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button size="lg" className="h-12 px-8">
              Buscar
            </Button>
          </div>

          <StatsSection stats={stats} />
        </div>
      </div>
    </section>
  );
}
