import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Room {
  id: string;
  customer_id: string;
  admin_id: string | null;
  status: "waiting" | "active" | "closed";
  created_at: string;
}

export function useChat(roomId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomStatus, setRoomStatus] = useState<
    "waiting" | "active" | "closed" | null
  >(null);

  // Buscar mensagens existentes (tenta Supabase, fallback para API)
  const fetchMessages = async () => {
    if (!roomId) return;

    setLoading(true);
    try {
      // Tentar via Supabase primeiro
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("Supabase error, tentando API REST:", error);
        // Fallback: buscar via API REST
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${apiUrl}/chat/rooms/${roomId}/messages`);
        const apiData = await response.json();
        setMessages(apiData || []);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    fetchMessages();

    // Inscrever-se para novas mensagens em tempo real
    const messagesChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    // Inscrever-se para mudanças de status da sala em tempo real
    const roomChannel = supabase
      .channel(`room-status:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const updatedRoom = payload.new as Room;
          setRoomStatus(updatedRoom.status);
          console.log("🔔 Status da sala atualizado:", updatedRoom.status);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [roomId]);

  const sendMessage = async (content: string, senderId: string) => {
    if (!roomId || !content.trim()) return;

    try {
      const { error } = await supabase.from("messages").insert({
        room_id: roomId,
        sender_id: senderId,
        content: content.trim(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refreshMessages: fetchMessages,
    roomStatus,
  };
}
