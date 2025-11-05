import { Injectable, ConflictException } from '@nestjs/common';
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

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const existingDocument = await this.usersRepository.findOne({
      where: { documento: createUserDto.documento },
    });

    if (existingDocument) {
      throw new ConflictException('Documento já cadastrado');
    }

    const hashedPassword = await argon2.hash(createUserDto.senha);

    const user = this.usersRepository.create({
      ...createUserDto,
      senha: hashedPassword,
      role: createUserDto.role || UserRole.CLIENT, // Default: CLIENT
    });

    const savedUser = await this.entityManager.save(user);

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
