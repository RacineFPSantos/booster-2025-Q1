import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, SYSTEM_PROMPT_VERSION } from './config/system-prompt.config';

const MODEL = 'googleai/gemini-2.5-flash';

export interface GenkitFlowResult {
  responseText: string;
  intentDetected?: string;
  suggestedProductIds?: number[];
  suggestedServiceIds?: number[];
  inputTokens?: number;
  outputTokens?: number;
  modelUsed: string;
  systemPromptVersion: string;
  wasFiltered: boolean;
}

const FALLBACK_SAFETY =
  'Não consigo responder a essa pergunta. Por favor, entre em contato com nossa equipe pelo chat ao vivo.';

const OFF_TOPIC_KEYWORDS = [
  'política', 'política', 'futebol', 'receita', 'piada', 'novela',
  'música', 'filme', 'notícia', 'eleição', 'briga', 'guerra',
];

export function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  if (OFF_TOPIC_KEYWORDS.some((kw) => lower.includes(kw))) return 'off_topic';
  if (/pe[cç]a|produto|filtro|óleo|pneu|bateria/.test(lower)) return 'product_recommendation';
  if (/servi[cç]o|revisão|alinhamento|balanceamento|trocar|instalar/.test(lower)) return 'service_inquiry';
  if (/agenda|horário|marcação|agendar|disponível/.test(lower)) return 'scheduling_help';
  if (/pre[cç]o|valor|quanto|custo|cobr/.test(lower)) return 'price_question';
  return 'general_question';
}

@Injectable()
export class GenkitService implements OnModuleInit {
  private readonly logger = new Logger(GenkitService.name);
  private ai: ReturnType<typeof genkit>;
  private googleAiClient: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.getOrThrow<string>('GOOGLE_GENAI_API_KEY');
    this.ai = genkit({ plugins: [googleAI({ apiKey })] });
    this.googleAiClient = new GoogleGenerativeAI(apiKey);
    this.logger.log('GenkitService inicializado com Gemini 2.0 Flash');
  }

  async embedText(text: string): Promise<number[]> {
    const model = this.googleAiClient.getGenerativeModel(
      { model: 'gemini-embedding-001' },
      { apiVersion: 'v1beta' },
    );
    const result = await model.embedContent({
      content: { role: '', parts: [{ text }] },
      outputDimensionality: 768,
    } as any);
    return result.embedding.values;
  }

  async runAutomotiveChatFlow(userMessage: string, context?: string, intent?: string): Promise<GenkitFlowResult> {
    try {
      let prompt: string;
      if (context) {
        prompt = `[CONTEXTO DA LOJA - use apenas para informar sua resposta]\n${context}\n[FIM DO CONTEXTO]\n\nPergunta do cliente: ${userMessage}`;
      } else {
        prompt = `[SEM CONTEXTO ESPECÍFICO - responda de forma genérica dentro do seu domínio]\n\nPergunta do cliente: ${userMessage}`;
      }

      const rawResult = await this.ai.generate({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt,
      });

      const usage = rawResult.usage;
      const inputTokens = usage?.inputTokens;
      const outputTokens = usage?.outputTokens;

      const responseText = rawResult.text?.trim();

      if (!responseText) {
        return {
          responseText: FALLBACK_SAFETY,
          modelUsed: MODEL,
          systemPromptVersion: SYSTEM_PROMPT_VERSION,
          wasFiltered: true,
        };
      }

      const intentDetected = intent ?? detectIntent(userMessage);

      return {
        responseText: responseText.length > 4000 ? responseText.slice(0, 4000) : responseText,
        intentDetected,
        inputTokens,
        outputTokens,
        modelUsed: MODEL,
        systemPromptVersion: SYSTEM_PROMPT_VERSION,
        wasFiltered: false,
      };
    } catch (error) {
      this.logger.error('Erro ao chamar Gemini:', error);
      return {
        responseText: FALLBACK_SAFETY,
        modelUsed: MODEL,
        systemPromptVersion: SYSTEM_PROMPT_VERSION,
        wasFiltered: true,
      };
    }
  }
}
