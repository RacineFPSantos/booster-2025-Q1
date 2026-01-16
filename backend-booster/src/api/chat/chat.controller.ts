import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  async openRoom(@Body('customerId') customerId: string) {
    return await this.chatService.createRoom(customerId);
  }

  @Post('messages')
  async sendMessage(
    @Body('roomId') roomId: string,
    @Body('senderId') senderId: string,
    @Body('content') content: string,
  ) {
    return await this.chatService.sendMessage(roomId, senderId, content);
  }

  // Rotas específicas ANTES de rotas com parâmetros
  @Get('rooms/waiting')
  async getWaitingRooms() {
    return await this.chatService.getWaitingRooms();
  }

  @Get('rooms/filter')
  async getRoomsByFilter(
    @Query('status') status?: 'waiting' | 'active' | 'closed',
    @Query('adminId') adminId?: string,
  ) {
    return await this.chatService.getRoomsByFilter(status, adminId);
  }

  @Get('rooms/all')
  async getAllRooms() {
    return await this.chatService.getAllRooms();
  }

  @Post('rooms/clean-inactive')
  async cleanInactiveRooms(@Body('inactiveMinutes') inactiveMinutes?: number) {
    return await this.chatService.cleanInactiveRooms(inactiveMinutes || 30);
  }

  // Rotas com parâmetros por último
  @Get('rooms/:roomId/messages')
  async getMessages(@Param('roomId') roomId: string) {
    return await this.chatService.getMessagesByRoom(roomId);
  }

  @Patch('rooms/:roomId/reopen')
  async reopenRoom(@Param('roomId') roomId: string) {
    return await this.chatService.reopenRoom(roomId);
  }

  @Patch('rooms/:roomId/status')
  async updateRoomStatus(
    @Param('roomId') roomId: string,
    @Body('status') status: 'active' | 'closed',
    @Body('adminId') adminId: string,
  ) {
    return await this.chatService.updateRoomStatus(roomId, status, adminId);
  }
}
