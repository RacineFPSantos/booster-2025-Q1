import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TipoClienteEnum } from '@shared/enums/database.enums';
import { UserRole } from '@shared/enums/database.enums';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column({ type: 'varchar', length: 14, unique: true, nullable: false })
  documento: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  senha: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: TipoClienteEnum,
    enumName: 'tipo_cliente_enum',
    nullable: false,
  })
  tipo_cliente: TipoClienteEnum;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nome: string;

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
