import { motion } from "framer-motion";
import {
  SearchIcon,
  CalendarIcon,
  MessageSquareIcon,
  TruckIcon,
} from "lucide-react";
import { containerVariants, cardVariants } from "@/lib/animation-variants";

const features = [
  {
    title: "Catálogo Inteligente",
    description:
      "Milhares de peças com busca inteligente e recomendações personalizadas para o seu veículo.",
    icon: SearchIcon,
  },
  {
    title: "Agendamento Online",
    description:
      "Agende serviços automotivos com horários flexíveis e confirmação instantânea.",
    icon: CalendarIcon,
  },
  {
    title: "Assistente IA 24h",
    description:
      "Tire dúvidas, encontre peças e receba suporte técnico a qualquer momento.",
    icon: MessageSquareIcon,
  },
  {
    title: "Entrega Expressa",
    description:
      "Receba suas peças com rapidez, segurança e rastreamento em tempo real.",
    icon: TruckIcon,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-theme-bg relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="bg-theme-surface border border-theme-border rounded-2xl p-8 hover:border-theme-border-hover transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary mb-3 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-theme-text-muted leading-relaxed text-sm transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
