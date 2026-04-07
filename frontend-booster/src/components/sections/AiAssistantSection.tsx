import { motion } from "framer-motion";
import { BotIcon, CheckCircleIcon, SendIcon } from "lucide-react";

const benefits = [
  "Encontre peças compatíveis com seu veículo",
  "Tire dúvidas técnicas instantaneamente",
  "Acompanhe pedidos e agendamentos",
  "Suporte 24 horas por dia, 7 dias por semana",
];

export function AiAssistantSection() {
  return (
    <section
      id="ia"
      className="py-24 bg-theme-surface border-y border-theme-border overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue mb-6">
              <BotIcon className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Novo Recurso
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-theme-text-primary mb-6 leading-tight transition-colors duration-300">
              Seu Assistente Automotivo com{" "}
              <span className="text-brand-blue">IA</span>
            </h2>

            <p className="text-theme-text-muted text-lg mb-8 leading-relaxed transition-colors duration-300">
              Não sabe qual peça comprar? Nosso assistente inteligente analisa o
              modelo do seu carro e recomenda exatamente o que você precisa,
              garantindo 100% de compatibilidade.
            </p>

            <ul className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-brand-blue shrink-0" />
                  <span className="text-theme-text-secondary transition-colors duration-300">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <button className="px-8 py-4 bg-brand-blue hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
              <BotIcon className="w-5 h-5" />
              Testar Assistente IA
            </button>
          </motion.div>

          {/* Right Content - Mock Chat UI */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue to-purple-600 rounded-2xl blur opacity-20" />

            <div className="relative bg-theme-bg border border-theme-border rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px] transition-colors duration-300">
              {/* Chat Header */}
              <div className="bg-theme-surface border-b border-theme-border p-4 flex items-center gap-4 transition-colors duration-300">
                <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center relative">
                  <BotIcon className="w-6 h-6 text-brand-blue" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-theme-surface rounded-full transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-theme-text-primary font-semibold transition-colors duration-300">
                    AI Car Assistant
                  </h3>
                  <p className="text-xs text-brand-blue font-medium">
                    Online agora
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
                {/* User Message */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="self-end max-w-[80%]"
                >
                  <div className="bg-theme-text-primary/10 text-theme-text-primary p-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed transition-colors duration-300">
                    Preciso de pastilhas de freio para um Civic 2020.
                  </div>
                  <span className="text-[10px] text-theme-text-muted mt-1 block text-right transition-colors duration-300">
                    10:42
                  </span>
                </motion.div>

                {/* AI Message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                  className="self-start max-w-[85%]"
                >
                  <div className="bg-brand-blue/10 border border-brand-blue/20 text-theme-text-secondary p-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed transition-colors duration-300">
                    Olá! Para o Honda Civic 2020, recomendo as{" "}
                    <strong>Pastilhas de Freio de Cerâmica Bosch</strong>. Elas
                    oferecem maior durabilidade e menor ruído.
                    <div className="mt-3 p-3 bg-theme-bg rounded-lg border border-theme-border flex items-center gap-3 transition-colors duration-300">
                      <div className="w-10 h-10 bg-theme-surface rounded flex items-center justify-center shrink-0 transition-colors duration-300">
                        <BotIcon className="w-5 h-5 text-theme-text-muted" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-theme-text-primary transition-colors duration-300">
                          Pastilha Bosch Cerâmica
                        </p>
                        <p className="text-xs text-brand-orange font-semibold">
                          R$ 189,90
                        </p>
                      </div>
                    </div>
                    <p className="mt-3">Deseja que eu adicione ao seu carrinho?</p>
                  </div>
                  <span className="text-[10px] text-theme-text-muted mt-1 block transition-colors duration-300">
                    10:42
                  </span>
                </motion.div>

                {/* User Message */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.0 }}
                  className="self-end max-w-[80%]"
                >
                  <div className="bg-theme-text-primary/10 text-theme-text-primary p-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed transition-colors duration-300">
                    Sim, por favor.
                  </div>
                  <span className="text-[10px] text-theme-text-muted mt-1 block text-right transition-colors duration-300">
                    10:43
                  </span>
                </motion.div>
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-theme-surface border-t border-theme-border transition-colors duration-300">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    className="w-full bg-theme-bg border border-theme-border rounded-full py-3 pl-4 pr-12 text-sm text-theme-text-primary focus:outline-none focus:border-brand-blue transition-colors duration-300"
                    disabled
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white">
                    <SendIcon className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
