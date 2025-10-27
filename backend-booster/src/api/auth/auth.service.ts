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

    // 2. Verificar se a senha está correta usando Argon2
    const senhaValida = await argon2.verify(user.senha, senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 3. Gerar o token JWT
    const payload = {
      sub: user.id_user, // "sub" é o padrão JWT para identificador do usuário
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // 4. Retornar o token e dados do usuário (sem a senha!)
    return {
      access_token: accessToken,
      user: {
        id: user.id_user,
        email: user.email,
        role: user.role,
        nome: user.nome,
      },
    };
  }

  /**
   * Registro público de novos usuários
   * Sempre cria com role CLIENT
   */
  async register(registerDto: RegisterDto) {
    // 1. Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // 2. Verificar se o documento já existe
    const existingDocument = await this.userRepository.findOne({
      where: { documento: registerDto.documento },
    });

    if (existingDocument) {
      throw new ConflictException('Documento já cadastrado');
    }

    // 3. Hash da senha com Argon2
    const hashedPassword = await argon2.hash(registerDto.senha);

    // 4. Criar o usuário (sempre como CLIENT)
    const user = this.userRepository.create({
      ...registerDto,
      senha: hashedPassword,
      role: UserRole.CLIENT, // Forçar role como CLIENT
    });

    // 5. Salvar no banco
    const savedUser = await this.userRepository.save(user);

    // 6. Gerar token JWT automaticamente
    const payload = {
      sub: savedUser.id_user,
      email: savedUser.email,
      role: savedUser.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // 7. Retornar token e dados do usuário (sem senha)
    return {
      access_token: accessToken,
      user: {
        id: savedUser.id_user,
        email: savedUser.email,
        role: savedUser.role,
        nome: savedUser.nome,
        tipo_cliente: savedUser.tipo_cliente,
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
