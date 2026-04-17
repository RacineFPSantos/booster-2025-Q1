import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiPublicController } from './ai-public.controller';
import { AiService } from './ai.service';

describe('AiPublicController', () => {
  let controller: AiPublicController;
  let aiService: { chat: jest.Mock };

  beforeEach(async () => {
    aiService = {
      chat: jest.fn().mockResolvedValue({
        response: 'Posso ajudar com pecas e servicos automotivos.',
        intentDetected: 'general_question',
        suggestedProductIds: [],
        suggestedServiceIds: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])],
      controllers: [AiPublicController],
      providers: [{ provide: AiService, useValue: aiService }],
    }).compile();

    controller = module.get<AiPublicController>(AiPublicController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls AiService without a user id and returns the chat response', async () => {
    const response = await controller.chat('Qual oleo devo usar?', {
      message: 'Qual oleo devo usar?',
      sessionId: 'public-session',
    });

    expect(aiService.chat).toHaveBeenCalledWith(
      null,
      'Qual oleo devo usar?',
      'public-session',
    );
    expect(response).toEqual({
      response: 'Posso ajudar com pecas e servicos automotivos.',
      intentDetected: 'general_question',
      suggestedProductIds: [],
      suggestedServiceIds: [],
    });
  });
});
