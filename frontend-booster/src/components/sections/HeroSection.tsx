import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRightIcon, CalendarIcon } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center -mt-16 pt-20 pb-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] transition-colors duration-300" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-theme-overlay-start via-theme-overlay-mid to-theme-overlay-end transition-colors duration-300" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-text-primary/5 border border-theme-border backdrop-blur-sm transition-colors duration-300"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-xs font-medium text-theme-text-secondary uppercase tracking-wider transition-colors duration-300">
              Assistente IA Online 24/7
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] text-theme-text-primary"
          >
            Peças e Serviços Automotivos com{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-blue-400">
              Inteligência Artificial
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-theme-text-muted mb-10 max-w-2xl mx-auto leading-relaxed transition-colors duration-300"
          >
            Encontre a peça exata para seu veículo, agende serviços
            especializados e conte com nosso assistente inteligente disponível
            24 horas para tirar suas dúvidas.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate("/pecas")}
              className="w-full sm:w-auto px-8 py-4 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 group"
            >
              Explorar Peças
              <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/servicos")}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-theme-border hover:bg-theme-surface text-theme-text-primary rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-5 h-5" />
              Agendar Serviço
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
