import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@shared/enums/database.enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard que verifica se o usuário tem a role necessária
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Pegar as roles necessárias do decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há roles definidas, permite acesso
    if (!requiredRoles) {
      return true;
    }

    // 2. Pegar o usuário da requisição (colocado lá pela JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // 3. Verificar se o usuário tem alguma das roles necessárias
    return requiredRoles.some((role) => user.role === role);
  }
}
