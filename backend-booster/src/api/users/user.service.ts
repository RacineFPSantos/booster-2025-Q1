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
      password_hash: hashedPassword,
      usuario_role: createUserDto.role || UserRole.CLIENT, // Default: CLIENT
    });

    const savedUser = await this.entityManager.save(user);

    const { password_hash, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async findAll() {
    const users = await this.usersRepository.find({
      order: { created_at: 'DESC' },
    });

    // Remove password_hash from all users
    return users.map((user) => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id_usuario: id });
    if (!user) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update({ id_usuario: id }, updateUserDto);
  }

  async remove(id: number) {
    // Soft delete: desativa ao invés de deletar
    await this.usersRepository.update({ id_usuario: id }, { is_active: false });
  }

  async updateRole(id: number, role: UserRole) {
    await this.usersRepository.update(
      { id_usuario: id },
      { usuario_role: role, tipo_usuario: role },
    );

    return this.findOne(id);
  }

  async updateStatus(id: number, isActive: boolean) {
    await this.usersRepository.update(
      { id_usuario: id },
      { is_active: isActive },
    );

    return this.findOne(id);
  }

  async getStats() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = await this.usersRepository.count();
    const clientes = await this.usersRepository.count({
      where: { usuario_role: UserRole.CLIENT },
    });
    const admins = await this.usersRepository.count({
      where: { usuario_role: UserRole.ADMIN },
    });
    const ativos = await this.usersRepository.count({
      where: { is_active: true },
    });
    const inativos = await this.usersRepository.count({
      where: { is_active: false },
    });
    const novosEsteMes = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :thisMonth', { thisMonth })
      .getCount();

    return {
      total,
      clientes,
      admins,
      ativos,
      inativos,
      novosEsteMes,
    };
  }
}
