import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Shortcut {
  icon: string;
  label: string;
  value?: string;
  requiresAuth?: boolean;
  action?: "navigate" | "show_categories" | "show_service_types" | "consultant";
  navigateTo?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  shortcuts?: Shortcut[];
}

const SESSION_ID = crypto.randomUUID();
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MAIN_SHORTCUTS: Shortcut[] = [
  { icon: "🔧", label: "Procurar peça", value: "Quero procurar uma peça para meu carro" },
  { icon: "🛠️", label: "Ver serviços", value: "Quais serviços vocês oferecem?" },
  { icon: "📦", label: "Acompanhar pedido", value: "Quero acompanhar meu pedido", requiresAuth: true },
  { icon: "💬", label: "Tirar dúvida", value: "Tenho uma dúvida sobre manutenção" },
];

const buildProductActions = (_vehicleName: string | null): Shortcut[] => [
  { icon: "🔍", label: "Ver todas as peças", action: "navigate", navigateTo: "/pecas" },
  { icon: "📂", label: "Filtrar por categoria", action: "show_categories" },
  { icon: "💬", label: "Falar com consultor", action: "navigate", navigateTo: "/contato" },
];

const SERVICE_ACTIONS: Shortcut[] = [
  { icon: "🛠️", label: "Ver todos os serviços", action: "navigate", navigateTo: "/servicos" },
  { icon: "📂", label: "Filtrar por tipo", action: "show_service_types" },
  { icon: "📅", label: "Agendar serviço", action: "navigate", navigateTo: "/servicos" },
  { icon: "💬", label: "Falar com consultor", action: "navigate", navigateTo: "/contato" },
];

const STOP_WORDS = new Set([
  'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'para', 'com',
  'em', 'no', 'na', 'o', 'a', 'os', 'as', 'meu', 'minha',
  'tenho', 'preciso', 'quero', 'meus', 'minhas', 'pelo', 'pela',
  'num', 'numa', 'seu', 'sua', 'é', 'e',
]);

function extractVehicle(text: string): string | null {
  const yearMatch = text.match(/\b((?:19|20)\d{2})\b/);
  if (!yearMatch) return null;

  const year = yearMatch[1];
  const words = text.substring(0, yearMatch.index).trim().split(/\s+/).filter(Boolean);

  const vehicleWords: string[] = [];
  for (let i = words.length - 1; i >= 0 && vehicleWords.length < 2; i--) {
    if (STOP_WORDS.has(words[i].toLowerCase())) break;
    vehicleWords.unshift(words[i]);
  }

  if (vehicleWords.length === 0) return null;

  const afterYear = text.substring(yearMatch.index! + year.length);
  const versionMatch = afterYear.match(/^\s+(\d+[.,]\d+)/);
  const version = versionMatch ? ' ' + versionMatch[1] : '';

  return `${vehicleWords.join(' ')} ${year}${version}`;
}

const CAR_MODELS = new Set([
  'civic', 'fit', 'hrv', 'crv', 'accord', 'city',
  'golf', 'gol', 'polo', 'voyage', 'saveiro', 'fox', 'up', 'tiguan', 'amarok', 'virtus', 'nivus',
  'corolla', 'yaris', 'etios', 'hilux', 'sw4', 'rav4',
  'onix', 'cruze', 'tracker', 'spin', 'cobalt', 'prisma', 'celta', 'agile', 'montana',
  'hb20', 'hb20s', 'ix35', 'tucson', 'creta',
  'sandero', 'logan', 'duster', 'kwid', 'stepway', 'captur',
  'ka', 'ecosport', 'fiesta', 'fusion', 'ranger', 'focus', 'territory',
  'palio', 'uno', 'siena', 'punto', 'bravo', 'cronos', 'toro', 'strada', 'argo', 'mobi', 'fastback',
  'kicks', 'march', 'versa', 'frontier', 'sentra',
  'compass', 'renegade', 'wrangler',
  's10', 'l200', 'hilux',
]);

function extractCarWithoutYear(text: string): string | null {
  if (/\b(?:19|20)\d{2}\b/.test(text)) return null;
  const words = text.split(/\s+/);
  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (CAR_MODELS.has(lower)) return word;
    if (/^[a-z]{1,4}\d{2,3}$/i.test(lower)) return word; // HB20, C3, SW4
  }
  return null;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Olá! Posso te ajudar a encontrar peças compatíveis com seu carro ou informações sobre serviços.\n\nQual veículo você usa?",
};

export function AiChatWidget() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [pendingCarName, setPendingCarName] = useState<string | null>(null);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const awaitingVehicle = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/categoria`)
      .then((r) => r.json())
      .then((data: { nome: string }[]) => setCategories(data.map((c) => c.nome)))
      .catch(() => {});

    fetch(`${API_BASE}/servicos/tipos`)
      .then((r) => r.json())
      .then((data: { nome: string }[]) => setServiceTypes(data.map((t) => t.nome)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleShortcutAction = (shortcut: Shortcut) => {
    if (shortcut.action === "navigate" && shortcut.navigateTo) {
      navigate(shortcut.navigateTo);
      setOpen(false);
      return;
    }

    if (shortcut.action === "show_categories") {
      const categoryShortcuts: Shortcut[] = categories.map((cat) => ({
        icon: "📂",
        label: cat,
        action: "navigate" as const,
        navigateTo: `/pecas?categoria=${encodeURIComponent(cat)}`,
      }));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Qual categoria de peça você procura?",
          shortcuts: categoryShortcuts,
        },
      ]);
      return;
    }

    if (shortcut.action === "show_service_types") {
      const typeShortcuts: Shortcut[] = serviceTypes.map((tipo) => ({
        icon: "🛠️",
        label: tipo,
        action: "navigate" as const,
        navigateTo: `/servicos?tipo=${encodeURIComponent(tipo)}`,
      }));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Qual tipo de serviço você precisa?",
          shortcuts: typeShortcuts,
        },
      ]);
      return;
    }

    if (shortcut.action === "consultant") {
      sendMessage("Quero falar com um consultor");
      return;
    }
  };

  const callApi = async (message: string, vehicleContext: string | null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const contextualMessage = vehicleContext
        ? `Meu veículo é ${vehicleContext}. ${message}`
        : message;
      const endpoint = isAuthenticated ? `${API_BASE}/ai/chat` : `${API_BASE}/ai/public/chat`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isAuthenticated && token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: contextualMessage, sessionId: SESSION_ID }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      const botMessage: Message = { role: "assistant", content: data.response };
      if (data.intentDetected === "product_recommendation") {
        botMessage.shortcuts = buildProductActions(vehicleContext);
      } else if (data.intentDetected === "service_inquiry") {
        botMessage.shortcuts = SERVICE_ACTIONS;
      }
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente em instantes." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const askForYear = (carName: string, originalQuery?: string) => {
    setPendingCarName(carName);
    setPendingQuery(originalQuery ?? null);
    const example = new Date().getFullYear() - 3;
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Qual o ano do seu ${carName}? Ex: ${example}`,
      },
    ]);
  };

  const sendMessage = async (text?: string, shortcut?: Shortcut) => {
    // Atalhos de ação não precisam de texto — verificar antes da validação de mensagem
    if (shortcut?.action) {
      handleShortcutAction(shortcut);
      return;
    }

    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;

    if (shortcut?.requiresAuth && !isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: messageText },
        {
          role: "assistant",
          content: "Para verificar seu pedido preciso que você entre na sua conta. Faça login e tente novamente.",
        },
      ]);
      return;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: messageText }]);

    // Usuário respondeu com o ano após sermos solicitados
    if (pendingCarName) {
      const yearMatch = messageText.match(/\b((?:19|20)\d{2})\b/);
      if (yearMatch) {
        const newVehicle = `${pendingCarName} ${yearMatch[1]}`;
        setVehicle(newVehicle);
        const query = pendingQuery ?? messageText;
        setPendingCarName(null);
        setPendingQuery(null);

        // Verificar se o pendingQuery tem intenção real além do nome do carro
        const intentCheck = query
          .replace(new RegExp(pendingCarName, 'gi'), '')
          .replace(/\b(?:19|20)\d{1,3}\b/g, '')
          .replace(/\b(meu|minha|um|uma|tenho|para|o|a)\b/gi, '')
          .trim();

        if (intentCheck.length < 3) {
          // Sem intenção real — mostrar atalhos como no fluxo normal
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Perfeito! Vou buscar peças e serviços para o seu ${newVehicle}.\n\nO que você precisa hoje?`,
              shortcuts: MAIN_SHORTCUTS,
            },
          ]);
        } else {
          await callApi(query, newVehicle);
        }
      } else {
        setPendingCarName(null);
        setPendingQuery(null);
        await callApi(messageText, vehicle);
      }
      return;
    }

    if (awaitingVehicle.current) {
      awaitingVehicle.current = false;
      const extracted = extractVehicle(messageText);

      if (!extracted) {
        // Sem ano — verificar se tem nome de carro reconhecível
        const carName = extractCarWithoutYear(messageText);
        if (carName) {
          askForYear(carName, messageText);
          return;
        }
        // Sem carro identificável — capturar mensagem inteira como veículo
        setVehicle(messageText);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Perfeito! Vou buscar peças e serviços para o seu ${messageText}.\n\nO que você precisa hoje?`,
            shortcuts: MAIN_SHORTCUTS,
          },
        ]);
        return;
      }

      setVehicle(extracted);

      // Mensagem tem intenção além do veículo — vai direto para a API
      if (messageText.trim() !== extracted.trim()) {
        await callApi(messageText, extracted);
        return;
      }

      // Só veículo — mostrar atalhos
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Perfeito! Vou buscar peças e serviços para o seu ${extracted}.\n\nO que você precisa hoje?`,
          shortcuts: MAIN_SHORTCUTS,
        },
      ]);
      return;
    }

    // Mensagem normal — verificar se menciona novo carro sem ano
    const carWithoutYear = extractCarWithoutYear(messageText);
    if (carWithoutYear) {
      askForYear(carWithoutYear, messageText);
      return;
    }

    await callApi(messageText, vehicle);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: "460px" }}
        >
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="text-white" size={18} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Assistente AI Car</p>
                <p className="text-blue-200 text-xs">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot className="text-blue-600" size={13} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>

                {msg.shortcuts && (
                  <div className="flex flex-col gap-1 pl-8">
                    {msg.shortcuts.map((s, si) => (
                      <button
                        key={si}
                        onClick={() => sendMessage(s.value, s)}
                        disabled={loading}
                        className="text-left text-xs bg-white border border-blue-200 text-blue-700 rounded-xl px-3 py-1.5 hover:bg-blue-50 transition-colors disabled:opacity-40"
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Bot className="text-blue-600" size={13} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="text-slate-400 animate-spin" size={16} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua dúvida..."
              disabled={loading}
              className="flex-1 text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Abrir assistente virtual"
      >
        {open ? <X size={22} /> : <Bot size={22} />}
      </button>
    </div>
  );
}
