import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ description: 'Resposta do assistente' })
  response: string;

  @ApiPropertyOptional({
    description: 'Intent detectado na mensagem do usuário',
    enum: [
      'product_recommendation',
      'service_inquiry',
      'scheduling_help',
      'price_question',
      'general_question',
      'off_topic',
    ],
  })
  intentDetected?: string;

  @ApiPropertyOptional({ type: [Number], description: 'IDs de produtos sugeridos pelo assistente' })
  suggestedProductIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'IDs de serviços sugeridos pelo assistente' })
  suggestedServiceIds?: number[];
}
