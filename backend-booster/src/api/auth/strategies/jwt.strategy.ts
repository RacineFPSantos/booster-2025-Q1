import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@api/users/entities/user.entity';

/**
 * Payload do JWT - dados que vêm dentro do token
 */
export interface JwtPayload {
  sub: number; // ID do usuário
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET não está definido no .env');
    }

    super({
      // 1. Extrair o token do header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. Rejeitar tokens expirados
      ignoreExpiration: false,

      // 3. Chave secreta para validar o token
      secretOrKey: secret,
    });
  }

  /**
   * Método executado automaticamente após o token ser validado
   * Aqui buscamos o usuário no banco para garantir que ele ainda existe
   */
  async validate(payload: JwtPayload) {
    const { sub: id } = payload;

    // Buscar usuário no banco
    const user = await this.userRepository.findOne({
      where: { id_user: id },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Retorna o usuário - ele será anexado ao request como req.user
    return {
      id: user.id_user,
      email: user.email,
      role: user.role,
      nome: user.nome,
    };
  }
}
