import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { AiLogService } from './ai-log.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { SanitizeInputPipe } from './pipes/sanitize-input.pipe';
import { AiThrottleGuard } from './guards/ai-throttle.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/database.enums';

@Controller('ai')
@UseGuards(JwtAuthGuard, AiThrottleGuard)
@Throttle({ default: { limit: 20, ttl: 60000 } })
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiLogService: AiLogService,
  ) {}

  /**
   * POST /ai/chat
   * Chat com o assistente automotivo (qualquer usuário autenticado)
   */
  @Post('chat')
  async chat(
    @Request() req,
    @Body('message', SanitizeInputPipe) message: string,
    @Body() dto: ChatRequestDto,
  ): Promise<ChatResponseDto> {
    return this.aiService.chat(req.user.id, message, dto.sessionId);
  }

  /**
   * GET /ai/logs
   * Lista todos os logs de interações com IA (apenas ADMIN)
   */
  @Get('logs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getLogs() {
    return this.aiLogService.findAll();
  }
}
