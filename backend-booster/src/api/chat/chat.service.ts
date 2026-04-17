// src/api/chat/chat.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Message } from './entities/message.entity';
import {
  CursorPage,
  encodeCursor,
  decodeCursor,
} from '../../shared/pagination/cursor-page';

interface RoomCursor {
  created_at: string;
  id: string;
}

interface MessageCursor {
  created_at: string;
  id: string;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  // 1. Criar ou retornar uma sala existente para o cliente
  async createRoom(customerId: string) {
    // Busca se já existe uma sala aberta ('waiting' ou 'active') para este cliente
    const existingRoom = await this.roomRepository.findOne({
      where: [
        { customer_id: customerId, status: 'waiting' },
        { customer_id: customerId, status: 'active' },
      ],
      order: { created_at: 'DESC' },
    });

    if (existingRoom) {
      return existingRoom;
    }

    // Se não houver, cria uma nova
    const newRoom = this.roomRepository.create({
      customer_id: customerId,
      status: 'waiting',
    });

    const savedRoom = await this.roomRepository.save(newRoom);

    // Enviar mensagem de boas-vindas automática
    const welcomeMessage = this.messageRepository.create({
      room_id: savedRoom.id,
      sender_id: 'system',
      content: 'Em alguns momentos um administrador entrará em contato.',
    });
    await this.messageRepository.save(welcomeMessage);

    return savedRoom;
  }

  // 2. Enviar uma mensagem
  async sendMessage(roomId: string, senderId: string, content: string) {
    // Verifica se a sala existe
    const room = await this.roomRepository.findOne({ where: { id: roomId } });

    if (!room) {
      throw new NotFoundException('Sala de chat não encontrada');
    }

    // Verifica se a sala está encerrada
    if (room.status === 'closed') {
      throw new Error('Não é possível enviar mensagens em uma sala encerrada');
    }

    const newMessage = this.messageRepository.create({
      room_id: roomId,
      sender_id: senderId,
      content: content,
    });

    return await this.messageRepository.save(newMessage);
  }

  // 3. Listar mensagens de uma sala (Histórico)
  async getMessagesByRoom(roomId: string) {
    return await this.messageRepository.find({
      where: { room_id: roomId },
      order: { created_at: 'ASC' },
    });
  }

  async getMessagesByRoomPaginated(
    roomId: string,
    limit = 50,
    cursor?: string,
  ): Promise<CursorPage<Message>> {
    const qb = this.messageRepository
      .createQueryBuilder('m')
      .where('m.room_id = :roomId', { roomId })
      .orderBy('m.created_at', 'ASC')
      .addOrderBy('m.id', 'ASC')
      .take(limit + 1);

    if (cursor) {
      const { created_at, id } = decodeCursor<MessageCursor>(cursor);
      qb.andWhere(
        '(m.created_at > :created_at) OR (m.created_at = :created_at AND m.id > :id)',
        { created_at, id },
      );
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const last = data[data.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor({
            created_at: last.created_at.toISOString(),
            id: last.id,
          })
        : null;

    return { data, nextCursor, hasMore, limit };
  }

  // 4. (Para o Admin) Listar todas as salas aguardando suporte ou ativas
  async getWaitingRooms() {
    return await this.roomRepository.find({
      where: [{ status: 'waiting' }, { status: 'active' }],
      order: { created_at: 'DESC' },
    });
  }

  // 4b. Listar salas por status e/ou admin
  async getRoomsByFilter(
    status?: 'waiting' | 'active' | 'closed',
    adminId?: string,
  ) {
    const queryBuilder = this.roomRepository.createQueryBuilder('room');

    if (status) {
      queryBuilder.andWhere('room.status = :status', { status });
    }

    if (adminId) {
      queryBuilder.andWhere('room.admin_id = :adminId', { adminId });
    }

    return await queryBuilder.orderBy('room.created_at', 'DESC').getMany();
  }

  async getRoomsByFilterPaginated(
    limit = 25,
    cursor?: string,
    status?: 'waiting' | 'active' | 'closed',
    adminId?: string,
  ): Promise<CursorPage<Room>> {
    const qb = this.roomRepository.createQueryBuilder('room');

    if (status) {
      qb.andWhere('room.status = :status', { status });
    }
    if (adminId) {
      qb.andWhere('room.admin_id = :adminId', { adminId });
    }

    if (cursor) {
      const { created_at, id } = decodeCursor<RoomCursor>(cursor);
      qb.andWhere(
        '(room.created_at < :created_at) OR (room.created_at = :created_at AND room.id < :id)',
        { created_at, id },
      );
    }

    qb.orderBy('room.created_at', 'DESC')
      .addOrderBy('room.id', 'DESC')
      .take(limit + 1);

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const last = data[data.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor({
            created_at: last.created_at.toISOString(),
            id: last.id,
          })
        : null;

    return { data, nextCursor, hasMore, limit };
  }

  // 4c. Listar todas as salas (para admin ver tudo)
  async getAllRooms() {
    return await this.roomRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  // 5. Atualizar status da sala
  async updateRoomStatus(
    roomId: string,
    status: 'active' | 'closed',
    adminId: string,
  ) {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });

    if (!room) {
      throw new NotFoundException('Sala de chat não encontrada');
    }

    const previousStatus = room.status;
    console.log(
      `🔄 Atualizando sala ${roomId}: ${previousStatus} -> ${status}`,
    );

    room.status = status;
    room.admin_id = adminId;

    // Se mudou de 'waiting' para 'active', enviar mensagem do sistema
    if (previousStatus === 'waiting' && status === 'active') {
      console.log(
        `💬 Criando mensagem do sistema: ${adminId} entrou na conversa`,
      );
      const systemMessage = this.messageRepository.create({
        room_id: roomId,
        sender_id: 'system',
        content: `${adminId} entrou na conversa`,
      });
      const savedMessage = await this.messageRepository.save(systemMessage);
      console.log('✅ Mensagem do sistema salva:', savedMessage);
    }

    // Se mudou para 'closed', enviar mensagem de encerramento ao cliente
    if (status === 'closed') {
      console.log(
        `💬 Criando mensagem de encerramento: ${adminId} finalizou a conversa`,
      );
      const closedMessage = this.messageRepository.create({
        room_id: roomId,
        sender_id: 'system',
        content: `O atendimento foi encerrado por ${adminId}. Obrigado pelo contato!`,
      });
      const savedMessage = await this.messageRepository.save(closedMessage);
      console.log('✅ Mensagem de encerramento salva:', savedMessage);
    }

    const updatedRoom = await this.roomRepository.save(room);
    console.log('✅ Status da sala atualizado:', updatedRoom);

    return updatedRoom;
  }

  // 6. Reabrir uma sala encerrada
  async reopenRoom(roomId: string) {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });

    if (!room) {
      throw new NotFoundException('Sala de chat não encontrada');
    }

    console.log(`🔄 Reabrindo sala ${roomId}`);

    room.status = 'waiting';
    room.admin_id = undefined; // Remove o admin anterior

    // Enviar mensagem do sistema informando que a sala foi reaberta
    const reopenMessage = this.messageRepository.create({
      room_id: roomId,
      sender_id: 'system',
      content: 'Conversa reaberta. Aguardando atendimento...',
    });
    await this.messageRepository.save(reopenMessage);

    const updatedRoom = await this.roomRepository.save(room);
    console.log('✅ Sala reaberta:', updatedRoom);

    return updatedRoom;
  }

  // 7. Limpar salas inativas (sem mensagens há X minutos)
  async cleanInactiveRooms(inactiveMinutes: number = 30) {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - inactiveMinutes);

    // Buscar salas waiting ou active antigas
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .where('room.status IN (:...statuses)', {
        statuses: ['waiting', 'active'],
      })
      .andWhere('room.created_at < :cutoffTime', { cutoffTime })
      .getMany();

    // Verificar se têm mensagens recentes
    const roomsToClose: Room[] = [];
    for (const room of rooms) {
      const lastMessage = await this.messageRepository.findOne({
        where: { room_id: room.id },
        order: { created_at: 'DESC' },
      });

      // Se não tem mensagens ou a última mensagem é antiga
      if (!lastMessage || new Date(lastMessage.created_at) < cutoffTime) {
        room.status = 'closed';
        roomsToClose.push(room);
      }
    }

    if (roomsToClose.length > 0) {
      await this.roomRepository.save(roomsToClose);
    }

    return {
      cleaned: roomsToClose.length,
      rooms: roomsToClose,
    };
  }
}
