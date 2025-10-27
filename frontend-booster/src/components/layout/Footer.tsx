import {
  Car,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                AI<span className="text-blue-400">Car</span>
              </span>
            </div>
            <p className="text-sm">
              A plataforma mais completa de peças automotivas e serviços
              especializados. Tecnologia e confiança para cuidar do seu veículo.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Produtos</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Peças de Motor
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Sistema de Freios
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Suspensão
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Elétrica
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Acessórios
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Serviços</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Manutenção Preventiva
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Diagnóstico
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Troca de Óleo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Alinhamento
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Agendar Horário
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  Av. Principal, 1234
                  <br />
                  São Paulo - SP
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>(11) 9999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>contato@AiCar.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>
                  Seg-Sex: 8h-18h
                  <br />
                  Sáb: 8h-12h
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; 2025 AiCar. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
