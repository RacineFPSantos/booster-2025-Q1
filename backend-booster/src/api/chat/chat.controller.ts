import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/database.enums';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Qualquer usuário autenticado pode abrir sala — customerId vem do JWT
  @Post('rooms')
  async openRoom(@Request() req) {
    return await this.chatService.createRoom(String(req.user.id));
  }

  // Qualquer usuário autenticado pode enviar mensagem — senderId vem do JWT
  @Post('messages')
  async sendMessage(
    @Request() req,
    @Body('roomId') roomId: string,
    @Body('content') content: string,
  ) {
    return await this.chatService.sendMessage(
      roomId,
      String(req.user.id),
      content,
    );
  }

  // Qualquer usuário autenticado pode ver mensagens de uma sala
  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    if (cursor !== undefined || limit !== undefined) {
      return await this.chatService.getMessagesByRoomPaginated(
        roomId,
        limit ? Math.min(parseInt(limit), 100) : 50,
        cursor,
      );
    }
    return await this.chatService.getMessagesByRoom(roomId);
  }

  // Somente ADMIN — rotas de gestão de salas
  @Get('rooms/waiting')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getWaitingRooms() {
    return await this.chatService.getWaitingRooms();
  }

  @Get('rooms/filter')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRoomsByFilter(
    @Query('status') status?: 'waiting' | 'active' | 'closed',
    @Query('adminId') adminId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    if (cursor !== undefined || limit !== undefined) {
      return await this.chatService.getRoomsByFilterPaginated(
        limit ? Math.min(parseInt(limit), 100) : 25,
        cursor,
        status,
        adminId,
      );
    }
    return await this.chatService.getRoomsByFilter(status, adminId);
  }

  @Get('rooms/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllRooms() {
    return await this.chatService.getAllRooms();
  }

  @Post('rooms/clean-inactive')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async cleanInactiveRooms(@Body('inactiveMinutes') inactiveMinutes?: number) {
    return await this.chatService.cleanInactiveRooms(inactiveMinutes || 30);
  }

  @Patch('rooms/:roomId/reopen')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async reopenRoom(@Param('roomId') roomId: string) {
    return await this.chatService.reopenRoom(roomId);
  }

  // adminId derivado do JWT — não pode ser forjado pelo cliente
  @Patch('rooms/:roomId/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateRoomStatus(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body('status') status: 'active' | 'closed',
  ) {
    return await this.chatService.updateRoomStatus(
      roomId,
      status,
      String(req.user.id),
    );
  }
}
