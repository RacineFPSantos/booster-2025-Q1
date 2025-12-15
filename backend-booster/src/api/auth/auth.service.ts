import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '@api/users/entities/user.entity';
import { LoginDto, RegisterDto } from './dto';
import { UserRole } from '@shared/enums/database.enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Realiza o login do usuário
   * @param loginDto - Credenciais do usuário (email e senha)
   * @returns Token JWT e informações do usuário
   */
  async login(loginDto: LoginDto) {
    const { email, senha } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await argon2.verify(user.password_hash, senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id_usuario,
      email: user.email,
      role: user.usuario_role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id_usuario,
        email: user.email,
        role: user.usuario_role,
        nome: user.nome,
      },
    };
  }

  /**
   * Registro público de novos usuários
   * Sempre cria com role CLIENT
   */
  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const existingDocument = await this.userRepository.findOne({
      where: { documento: registerDto.documento },
    });

    if (existingDocument) {
      throw new ConflictException('Documento já cadastrado');
    }

    const hashedPassword = await argon2.hash(registerDto.senha);

    const user = this.userRepository.create({
      ...registerDto,
      password_hash: hashedPassword,
      usuario_role: UserRole.CLIENT,
    });

    const savedUser = await this.userRepository.save(user);

    const payload = {
      sub: savedUser.id_usuario,
      email: savedUser.email,
      role: savedUser.usuario_role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: savedUser.id_usuario,
        email: savedUser.email,
        role: savedUser.usuario_role,
        nome: savedUser.nome,
        tipo_usuario: savedUser.tipo_usuario,
      },
    };
  }

  /**
   * Hash de senha usando Argon2 (útil para criar usuários)
   * @param senha - Senha em texto plano
   * @returns Senha hasheada
   */
  async hashPassword(senha: string): Promise<string> {
    return await argon2.hash(senha);
  }
}
