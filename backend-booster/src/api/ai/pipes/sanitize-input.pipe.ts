import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

const INJECTION_BLOCKLIST = [
  'ignore previous instructions',
  'ignore all instructions',
  'disregard previous',
  'you are now',
  'new persona',
  'pretend you are',
  'act as if',
  'forget your instructions',
  'override your',
  'system prompt',
];

@Injectable()
export class SanitizeInputPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Mensagem deve ser uma string');
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new BadRequestException('Mensagem não pode estar vazia');
    }

    if (trimmed.length > 2000) {
      throw new BadRequestException(
        'Mensagem não pode ultrapassar 2000 caracteres',
      );
    }

    // Remove tags HTML
    const stripped = trimmed.replace(/<[^>]*>/g, '');

    // Blocklist anti-prompt-injection
    const lower = stripped.toLowerCase();
    for (const pattern of INJECTION_BLOCKLIST) {
      if (lower.includes(pattern)) {
        throw new BadRequestException('Mensagem contém conteúdo não permitido');
      }
    }

    return stripped;
  }
}
