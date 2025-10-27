import {
  Package,
  TruckIcon,
  Users,
  CreditCard,
  Award,
  Headphones,
} from "lucide-react";
import { FeatureCard } from "../cards/FeatureCard";

export function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: "Peças Originais",
      description:
        "Trabalhamos apenas com peças certificadas e originais de fábrica",
      gradientColors: "from-blue-500 to-blue-600",
    },
    {
      icon: TruckIcon,
      title: "Entrega Rápida",
      description: "Entregamos em até 24h para a sua região ou retire na loja",
      gradientColors: "from-green-500 to-green-600",
    },
    {
      icon: Users,
      title: "Atendimento Especializado",
      description: "Equipe técnica qualificada para te ajudar na escolha certa",
      gradientColors: "from-purple-500 to-purple-600",
    },
    {
      icon: CreditCard,
      title: "Parcele sem Juros",
      description: "Até 12x sem juros em compras acima de R$ 500",
      gradientColors: "from-orange-500 to-orange-600",
    },
    {
      icon: Award,
      title: "Melhor Preço",
      description: "Garantimos o melhor preço ou devolvemos a diferença",
      gradientColors: "from-red-500 to-red-600",
    },
    {
      icon: Headphones,
      title: "Suporte 24/7",
      description: "Atendimento online sempre que você precisar",
      gradientColors: "from-cyan-500 to-cyan-600",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Por que escolher a AiCar?
          </h2>
          <p className="text-lg text-slate-600">
            Tecnologia e confiança para cuidar do seu veículo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradientColors={feature.gradientColors}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
