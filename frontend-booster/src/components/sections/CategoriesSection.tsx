import { Settings, Zap, Cog, Sparkles } from "lucide-react";
import { CategoryCard } from "../cards/CategoryCard";
import { useNavigate } from "react-router-dom";

export function CategoriesSection() {
  const navigate = useNavigate();
  const categories = [
    {
      icon: Settings,
      title: "Motores",
      dbName: "MOTORES",
      description: "Filtros, correias, velas e componentes do motor",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
    },
    {
      icon: Settings,
      title: "Freios",
      dbName: "FREIOS",
      description: "Pastilhas, discos, fluidos e sistemas de freio",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
    },
    {
      icon: Settings,
      title: "Suspensão",
      dbName: "SUSPENSAO",
      description: "Amortecedores, molas e componentes de suspensão",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
    },
    {
      icon: Zap,
      title: "Elétrica",
      dbName: "ELETRICA",
      description: "Baterias, alternadores e sistema elétrico",
      iconColor: "text-yellow-600",
      iconBgColor: "bg-yellow-100",
    },
    {
      icon: Cog,
      title: "Transmissão",
      dbName: "TRANSMISSAO",
      description: "Embreagem, câmbio e sistema de transmissão",
      iconColor: "text-green-600",
      iconBgColor: "bg-green-100",
    },
    {
      icon: Sparkles,
      title: "Acessórios",
      dbName: "ACESSORIOS",
      description: "Tapetes, capas, som e customização",
      iconColor: "text-orange-600",
      iconBgColor: "bg-orange-100",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Categorias de Peças
          </h2>
          <p className="text-lg text-slate-600">
            Encontre extamente o que seu veículo precisa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              icon={category.icon}
              title={category.title}
              description={category.description}
              iconColor={category.iconColor}
              iconBgColor={category.iconBgColor}
              onClick={() =>
                navigate(
                  `/pecas?categoria=${encodeURIComponent(category.dbName)}`,
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
