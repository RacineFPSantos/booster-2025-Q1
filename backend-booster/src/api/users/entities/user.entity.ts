import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TipoClienteEnum } from '@shared/enums/database.enums';
import { UserRole } from '@shared/enums/database.enums';

@Entity('usuario')
export class User {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id_usuario: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  documento: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: false })
  password_hash: string;

  @Column({ type: 'varchar', nullable: false })
  nome: string;

  @Column({
    name: 'tipo_usuario',
    type: 'enum',
    enum: UserRole,
    enumName: 'tipo_usuario_enum',
    default: UserRole.CLIENT,
  })
  tipo_usuario: UserRole;

  @Column({
    name: 'usuario_role',
    type: 'enum',
    enum: UserRole,
    enumName: 'usuario_role_enum',
    default: UserRole.CLIENT,
  })
  usuario_role: UserRole;

  @Column({
    name: 'is_active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  is_active: boolean;

  @Column({
    type: 'timestamp without time zone',
    nullable: false,
    default: () => 'NOW()',
  })
  created_at: Date;

  @Column({
    type: 'timestamp without time zone',
    nullable: false,
    default: () => 'NOW()',
  })
  updated_at: Date;
}
