import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carrinho')
export class Cart {
  @PrimaryGeneratedColumn({ name: 'id_carrinho' })
  id_carrinho: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario: User;

  @Column({ name: 'id_usuario', type: 'int', nullable: false })
  id_usuario: number;

  @OneToMany(() => CartItem, (item) => item.carrinho, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

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
