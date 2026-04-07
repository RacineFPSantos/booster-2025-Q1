import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { SanitizeInputPipe } from './pipes/sanitize-input.pipe';
import { AiThrottleGuard } from './guards/ai-throttle.guard';

@Controller('ai/public')
@UseGuards(AiThrottleGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
export class AiPublicController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/public/chat
   * Chat público sem autenticação — rate limit por IP (10 req/min)
   * Não acessa dados pessoais do usuário
   */
  @Post('chat')
  async chat(
    @Body('message', SanitizeInputPipe) message: string,
    @Body() dto: ChatRequestDto,
  ): Promise<ChatResponseDto> {
    return this.aiService.chat(null, message, dto.sessionId);
  }
}
