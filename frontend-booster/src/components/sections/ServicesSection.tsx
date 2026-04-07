import { Wrench, CheckCircle2, Clock, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { ServiceCard } from "../cards/ServiceCard";
import { motion } from "framer-motion";
import { containerVariants, cardVariants } from "@/lib/animation-variants";

export function ServicesSection() {
  const services = [
    {
      icon: Wrench,
      title: "Manutenção Preventiva",
      description: "Revisões completas para evitar problemas futuros",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
    },
    {
      icon: CheckCircle2,
      title: "Diagnóstico Computadorizado",
      description: "Identificação precisa de problemas eletrônicos",
      iconColor: "text-green-600",
      iconBgColor: "bg-green-100",
    },
    {
      icon: Clock,
      title: "Serviço Expresso",
      description: "Troca de óleo e filtros em até 30 minutos",
      iconColor: "text-orange-600",
      iconBgColor: "bg-orange-100",
    },
    {
      icon: Shield,
      title: "Garantia Total",
      description: "Garantia de 90 dias em todos os serviços",
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-100",
    },
  ];

  return (
    <section className="py-20 bg-theme-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-text-primary mb-4">
            Oficina Completa
          </h2>
          <p className="text-lg text-theme-text-secondary">
            Serviços especializados com equipamentos de ponta
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={cardVariants}>
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                iconColor={service.iconColor}
                iconBgColor={service.iconBgColor}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button size="lg" className="h-12 px-8">
            Agendar Serviço Agora
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
