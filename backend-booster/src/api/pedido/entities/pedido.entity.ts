import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PedidoItem } from './pedido-item.entity';

export enum StatusPedidoEnum {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn({ name: 'id_pedido' })
  id_pedido: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_cliente' })
  usuario: User;

  @Column({ name: 'id_cliente', type: 'int', nullable: false })
  id_cliente: number;

  @Column({ name: 'id_usuario', type: 'int', nullable: false })
  id_usuario: number;

  @OneToMany(() => PedidoItem, (item) => item.pedido, {
    cascade: true,
    eager: true,
  })
  items: PedidoItem[];

  @Column({
    type: 'timestamp without time zone',
    nullable: false,
    default: () => 'NOW()',
  })
  data_hora: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  valor_total: number;

  @Column({
    type: 'enum',
    enum: StatusPedidoEnum,
    enumName: 'status_pedido_enum',
    default: StatusPedidoEnum.PENDENTE,
  })
  status: StatusPedidoEnum;

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
