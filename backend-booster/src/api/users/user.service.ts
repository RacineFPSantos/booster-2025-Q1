import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { UserRole } from '@shared/enums/database.enums';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Cria um novo usuário (usado por ADMINs)
   * Permite definir a role
   */
  async create(createUserDto: CreateUserDto) {
    // 1. Verificar se o email já existe
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // 2. Verificar se o documento já existe
    const existingDocument = await this.usersRepository.findOne({
      where: { documento: createUserDto.documento },
    });

    if (existingDocument) {
      throw new ConflictException('Documento já cadastrado');
    }

    // 3. Hash da senha com Argon2
    const hashedPassword = await argon2.hash(createUserDto.senha);

    // 4. Criar o usuário
    const user = this.usersRepository.create({
      ...createUserDto,
      senha: hashedPassword,
      role: createUserDto.role || UserRole.CLIENT, // Default: CLIENT
    });

    // 5. Salvar no banco
    const savedUser = await this.entityManager.save(user);

    // 6. Remover a senha do retorno
    const { senha, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    return this.usersRepository.findOneBy({ id_user: id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update({ id_user: id }, updateUserDto);
  }

  async remove(id: number) {
    await this.usersRepository.delete({ id_user: id });
  }
}
