import { Injectable, Logger } from '@nestjs/common';
import { GenkitService, detectIntent } from './genkit.service';
import { AiLogService } from './ai-log.service';
import { RagService } from './rag.service';
import { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly genkitService: GenkitService,
    private readonly aiLogService: AiLogService,
    private readonly ragService: RagService,
  ) {}

  async chat(
    userId: number | null,
    message: string,
    sessionId?: string,
  ): Promise<ChatResponseDto> {
    const startMs = Date.now();

    const intent = detectIntent(message);
    const ragContext = await this.ragService.retrieveContext(message, intent);
    const result = await this.genkitService.runAutomotiveChatFlow(message, ragContext, intent);

    const latencyMs = Date.now() - startMs;

    // Fire-and-forget: falha de log nunca propaga erro para o cliente
    this.aiLogService
      .persist({
        userId,
        sessionId,
        promptText: message,
        systemPromptVersion: result.systemPromptVersion,
        responseText: result.responseText,
        intentDetected: result.intentDetected,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: (result.inputTokens ?? 0) + (result.outputTokens ?? 0),
        modelUsed: result.modelUsed,
        latencyMs,
        wasFiltered: result.wasFiltered,
      })
      .catch((err) =>
        this.logger.error('Falha ao persistir log de IA (não-crítico):', err),
      );

    return {
      response: result.responseText,
      intentDetected: result.intentDetected,
      suggestedProductIds: result.suggestedProductIds,
      suggestedServiceIds: result.suggestedServiceIds,
    };
  }
}
