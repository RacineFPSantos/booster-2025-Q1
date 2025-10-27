import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que valida o JWT
 * Usa automaticamente a JwtStrategy que criamos
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
