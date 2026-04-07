import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AiThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rate limit por userId autenticado, não por IP
    // Evita problemas com múltiplos usuários atrás de NAT ou proxy
    const userId = req.user?.id;
    return userId ? `ai-throttle:user:${userId}` : `ai-throttle:ip:${req.ip}`;
  }
}
