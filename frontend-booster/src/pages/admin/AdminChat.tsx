import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";

interface Room {
  id: string;
  customer_id: string;
  admin_id: string | null;
  status: "waiting" | "active" | "closed";
  created_at: string;
}

type FilterType = "open" | "my-rooms" | "closed" | "all";

export function AdminChat() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [filter, setFilter] = useState<FilterType>("open");
  const adminId = user?.nome || "Administrador";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, sendMessage, refreshMessages } = useChat(
    selectedRoom?.id || null,
  );

  // Buscar salas aguardando
  useEffect(() => {
    fetchWaitingRooms();
    const interval = setInterval(fetchWaitingRooms, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, [filter]); // Recarrega quando o filtro mudar

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [messages]);

  // Atualizar mensagens periodicamente quando uma sala está selecionada
  useEffect(() => {
    if (selectedRoom) {
      const interval = setInterval(() => {
        refreshMessages();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom, refreshMessages]);

  const fetchWaitingRooms = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      let url = "";

      switch (filter) {
        case "open":
          url = `${apiUrl}/chat/rooms/waiting`; // waiting + active
          break;
        case "my-rooms":
          url = `${apiUrl}/chat/rooms/filter?adminId=${encodeURIComponent(adminId)}`;
          break;
        case "closed":
          url = `${apiUrl}/chat/rooms/filter?status=closed`;
          break;
        case "all":
          url = `${apiUrl}/chat/rooms/all`;
          break;
      }

      console.log("🔍 Buscando salas com filtro:", filter, "URL:", url);
      const response = await fetch(url);
      console.log("📡 Response status:", response.status);
      if (!response.ok) throw new Error("Erro ao buscar salas");
      const data = await response.json();
      console.log("📦 Salas recebidas:", data);
      setRooms(data);
    } catch (error) {
      console.error("❌ Erro ao buscar salas:", error);
    }
  };

  const handleSelectRoom = async (room: Room) => {
    setSelectedRoom(room);
    // Marcar sala como ativa se ainda estiver em waiting
    if (room.status === "waiting") {
      await updateRoomStatus(room.id, "active");
      // Atualizar o estado local da sala selecionada
      setSelectedRoom({ ...room, status: "active", admin_id: adminId });
    }
  };

  const updateRoomStatus = async (
    roomId: string,
    status: "active" | "closed",
  ) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      console.log("📡 Atualizando status:", { roomId, status, adminId });
      const response = await fetch(`${apiUrl}/chat/rooms/${roomId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminId }),
      });
      const result = await response.json();
      console.log("✅ Resposta do servidor:", result);
      fetchWaitingRooms();
      // Atualizar mensagens após mudança de status
      if (selectedRoom?.id === roomId) {
        setTimeout(() => refreshMessages(), 500);
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar status da sala:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRoom) return;

    try {
      await sendMessage(messageInput, adminId);
      setMessageInput("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  const handleCleanInactiveRooms = async () => {
    if (
      !confirm("Deseja encerrar todas as salas inativas há mais de 30 minutos?")
    ) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/chat/rooms/clean-inactive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inactiveMinutes: 30 }),
      });

      if (!response.ok) throw new Error("Erro ao limpar salas");

      const result = await response.json();
      alert(`${result.cleaned} sala(s) inativa(s) encerrada(s) com sucesso!`);
      fetchWaitingRooms();
    } catch (error) {
      console.error("Erro ao limpar salas:", error);
      alert("Erro ao limpar salas inativas.");
    }
  };

  const getStatusBadge = (status: Room["status"]) => {
    const styles = {
      waiting: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    const labels = {
      waiting: "Aguardando",
      active: "Ativo",
      closed: "Encerrado",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Chat de Suporte</h1>
          <p className="text-slate-600">
            Gerencie as conversas com os clientes
          </p>
        </div>
        <button
          onClick={handleCleanInactiveRooms}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          <Trash2 size={18} />
          Limpar Salas Inativas
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "open"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Abertas
        </button>
        <button
          onClick={() => setFilter("my-rooms")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "my-rooms"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Minhas Conversas
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "closed"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Encerradas
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Todas
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
        {/* Lista de Salas */}
        <div className="col-span-4 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquare size={20} />
              Conversas Abertas ({rooms.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <AlertCircle
                  className="mx-auto mb-2 text-slate-400"
                  size={40}
                />
                <p className="text-sm">Nenhuma conversa aberta</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                      selectedRoom?.id === room.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-800">
                            {room.customer_id}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(room.created_at).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(room.status)}
                      {room.status === "waiting" && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Área de Chat */}
        <div className="col-span-8 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Header do Chat */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedRoom.customer_id}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {getStatusBadge(selectedRoom.status)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedRoom.status === "active" && (
                    <button
                      onClick={() =>
                        updateRoomStatus(selectedRoom.id, "closed")
                      }
                      className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Encerrar Chat
                    </button>
                  )}
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {loading && messages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <p>Carregando mensagens...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <MessageSquare
                      className="mx-auto mb-2 text-slate-400"
                      size={48}
                    />
                    <p>Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    // Mensagem do sistema (centralizada)
                    if (msg.sender_id === "system") {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <div className="bg-slate-200 text-slate-600 px-4 py-2 rounded-full text-xs italic">
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
                          msg.sender_id === adminId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.sender_id === adminId
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-slate-200 text-slate-800"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender_id === adminId
                                ? "text-blue-100"
                                : "text-slate-500"
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
                className="p-4 border-t border-slate-200"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      selectedRoom.status === "closed"
                        ? "Chat encerrado"
                        : "Digite sua mensagem..."
                    }
                    disabled={selectedRoom.status === "closed"}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={
                      !messageInput.trim() || selectedRoom.status === "closed"
                    }
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={18} />
                  </button>
                </div>
                {selectedRoom.status === "closed" && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Esta conversa foi encerrada. O cliente pode reabrir a
                    conversa se necessário.
                  </p>
                )}
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <MessageSquare
                  className="mx-auto mb-4 text-slate-400"
                  size={64}
                />
                <p>Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
