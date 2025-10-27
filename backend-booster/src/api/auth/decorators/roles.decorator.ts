import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@shared/enums/database.enums';

export const ROLES_KEY = 'roles';

/**
 * Decorator para definir quais roles podem acessar uma rota
 *
 * Exemplo de uso:
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 * adminRoute() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
