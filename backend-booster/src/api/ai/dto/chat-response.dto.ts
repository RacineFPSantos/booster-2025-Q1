export class ChatResponseDto {
  response: string;
  intentDetected?: string;
  suggestedProductIds?: number[];
  suggestedServiceIds?: number[];
}
