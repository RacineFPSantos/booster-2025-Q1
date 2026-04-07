import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiInteractionLog } from './entities/ai-interaction-log.entity';

export interface CreateAiLogDto {
  userId?: number | null;
  sessionId?: string;
  promptText: string;
  systemPromptVersion: string;
  responseText: string;
  intentDetected?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  modelUsed: string;
  latencyMs: number;
  wasFiltered: boolean;
}

@Injectable()
export class AiLogService {
  private readonly logger = new Logger(AiLogService.name);

  constructor(
    @InjectRepository(AiInteractionLog)
    private readonly repo: Repository<AiInteractionLog>,
  ) {}

  async persist(data: CreateAiLogDto): Promise<void> {
    const log = this.repo.create({
      user_id: data.userId ?? null,
      session_id: data.sessionId ?? null,
      prompt_text: data.promptText,
      system_prompt_version: data.systemPromptVersion,
      response_text: data.responseText,
      intent_detected: data.intentDetected ?? null,
      input_tokens: data.inputTokens ?? null,
      output_tokens: data.outputTokens ?? null,
      total_tokens: data.totalTokens ?? null,
      model_used: data.modelUsed,
      latency_ms: data.latencyMs,
      was_filtered: data.wasFiltered,
    });

    await this.repo.save(log);
    this.logger.debug(`Log AI persistido: user=${data.userId}, latency=${data.latencyMs}ms`);
  }

  async findByUser(userId: number): Promise<AiInteractionLog[]> {
    return this.repo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findAll(): Promise<AiInteractionLog[]> {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }
}
