import { useState } from "react";
import { Settings, Zap, Cog, Sparkles, Search } from "lucide-react";
import { CategoryCard } from "../cards/CategoryCard";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { containerVariants, cardVariants } from "@/lib/animation-variants";

export function CategoriesSection() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/pecas?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };
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
    <section className="py-20 bg-theme-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-text-primary mb-4">
            Categorias de Peças
          </h2>
          <p className="text-lg text-theme-text-secondary">
            Encontre exatamente o que seu veículo precisa
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-text-muted" />
              <Input
                placeholder="Buscar peças, serviços ou categoria..."
                className="pl-10 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
              Buscar
            </Button>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((category, index) => (
            <motion.div key={index} variants={cardVariants}>
              <CategoryCard
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
