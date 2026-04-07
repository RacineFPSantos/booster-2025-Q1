import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Mail,
  MessageSquare,
  ExternalLink,
  Send,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";

export function Contato() {
  const { user, isAuthenticated } = useAuth();
  // Estado para controlar o que exibir: 'options', 'email' ou 'chat'
  const [view, setView] = useState<"options" | "email" | "chat">("options");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Identificador do usuário atual para comparar com sender_id das mensagens
  const myId = user ? String(user.id) : null;

  const { messages, loading, sendMessage, roomStatus } = useChat(activeRoomId);

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [messages]);

  const handleWhatsApp = () => {
    const phone = "5511999999999"; // Substitua pelo seu número
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      alert("Você precisa estar logado para usar o chat ao vivo.");
      return;
    }

    setIsCreatingRoom(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${apiUrl}/chat/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) throw new Error("Erro ao criar sala");

      const room = await response.json();
      setActiveRoomId(room.id);
      setView("chat");
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
      alert("Erro ao conectar ao chat. Tente novamente.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoomId) return;

    try {
      await sendMessage(messageInput, myId ?? "");
      setMessageInput("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  const handleReopenChat = async () => {
    if (!activeRoomId) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${apiUrl}/chat/rooms/${activeRoomId}/reopen`,
        {
          method: "PATCH",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!response.ok) throw new Error("Erro ao reabrir sala");

      const updatedRoom = await response.json();
      console.log("✅ Sala reaberta:", updatedRoom);
    } catch (error) {
      console.error("Erro ao reabrir chat:", error);
      alert("Erro ao reabrir conversa. Tente novamente.");
    }
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-bold text-theme-text-primary">
            Como podemos ajudar?
          </h1>
          <p className="text-theme-text-secondary mt-2">
            Escolha o canal de sua preferência.
          </p>
        </div>

        {view === "options" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="bg-theme-elevated p-8 rounded-xl shadow-sm border border-theme-border hover:border-green-500 hover:shadow-md transition-all group"
            >
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500 transition-colors">
                <MessageCircle className="text-green-600 group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-lg">WhatsApp</h3>
              <p className="text-sm text-theme-text-muted mb-4">
                Resposta em instantes
              </p>
              <span className="text-blue-600 text-sm flex items-center justify-center gap-1">
                Conversar agora <ExternalLink size={14} />
              </span>
            </button>

            {/* Card Chat */}
            <div className="bg-theme-elevated p-8 rounded-xl shadow-sm border border-theme-border">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Chat ao Vivo</h3>
              <p className="text-sm text-theme-text-muted mb-4">
                Fale com um consultor
              </p>
              {isAuthenticated ? (
                <>
                  <p className="text-xs text-slate-400 mb-3">
                    Conectado como <strong>{user?.nome}</strong>
                  </p>
                  <button
                    onClick={handleStartChat}
                    disabled={isCreatingRoom}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                  >
                    {isCreatingRoom ? "Conectando..." : "Iniciar Chat"}
                  </button>
                </>
              ) : (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  Faça login para usar o chat ao vivo.
                </p>
              )}
            </div>

            {/* Card Email */}
            <button
              onClick={() => setView("email")}
              className="bg-theme-elevated p-8 rounded-xl shadow-sm border border-theme-border hover:border-purple-500 hover:shadow-md transition-all group"
            >
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors">
                <Mail className="text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-lg">E-mail</h3>
              <p className="text-sm text-theme-text-muted mb-4">Deixe uma mensagem</p>
              <span className="text-blue-600 text-sm">Enviar formulário</span>
            </button>
          </div>
        ) : view === "chat" ? (
          <div className="max-w-2xl mx-auto bg-theme-elevated rounded-xl shadow-sm border border-theme-border flex flex-col h-[600px]">
            {/* Header do Chat */}
            <div className="p-4 border-b border-theme-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Chat ao Vivo</h3>
                  <p className="text-xs text-theme-text-muted">
                    {loading ? "Carregando..." : "Online"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setView("options");
                  setActiveRoomId(null);
                }}
                className="text-sm text-theme-text-secondary hover:text-theme-text-primary"
              >
                ✕
              </button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-theme-surface">
              {messages.length === 0 ? (
                <div className="text-center text-theme-text-muted py-8">
                  <MessageSquare
                    className="mx-auto mb-2 text-slate-400"
                    size={48}
                  />
                  <p>Inicie a conversa enviando uma mensagem</p>
                </div>
              ) : (
                messages.map((msg) => {
                  // Mensagem do sistema (centralizada)
                  if (msg.sender_id === "system") {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="bg-theme-surface-light text-theme-text-secondary px-4 py-2 rounded-full text-xs italic">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  // Mensagens normais
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === myId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.sender_id === myId
                            ? "bg-blue-600 text-white"
                            : "bg-theme-elevated border border-theme-border text-theme-text-primary"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender_id === myId
                              ? "text-blue-100"
                              : "text-theme-text-muted"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-theme-border"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={
                    roomStatus === "closed"
                      ? "Chat encerrado"
                      : "Digite sua mensagem..."
                  }
                  disabled={roomStatus === "closed"}
                  className="flex-1 px-4 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || roomStatus === "closed"}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </div>
              {roomStatus === "closed" && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 text-center">
                    Este chat foi encerrado pelo atendente. Você pode reabrir
                    esta conversa para continuar o atendimento.
                  </p>
                  <button
                    onClick={handleReopenChat}
                    className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Reabrir Conversa
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-theme-elevated p-8 rounded-xl shadow-sm border border-theme-border">
            <button
              onClick={() => setView("options")}
              className="text-sm text-blue-600 hover:underline mb-6 flex items-center gap-2"
            >
              ← Voltar para opções
            </button>

            <h2 className="text-2xl font-bold mb-6">Envie sua mensagem</h2>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-theme-text-secondary"
                >
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full border border-theme-border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite seu nome"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-theme-text-secondary"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full border border-theme-border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite seu email"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-theme-text-secondary"
                >
                  Mensagem
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 block w-full border border-theme-border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Como podemos ajudar?"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        )}
    </main>
  );
}
