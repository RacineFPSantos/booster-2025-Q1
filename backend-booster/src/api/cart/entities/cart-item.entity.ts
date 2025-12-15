import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Produto } from '../../catalog/produto/entities/produto.entity';

@Entity('carrinho_item')
export class CartItem {
  @PrimaryGeneratedColumn({ name: 'id_carrinho_item' })
  id_carrinho_item: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_carrinho' })
  carrinho: Cart;

  @Column({ name: 'id_carrinho', type: 'int', nullable: false })
  id_carrinho: number;

  @ManyToOne(() => Produto, { eager: true })
  @JoinColumn({ name: 'id_produto' })
  produto: Produto;

  @Column({ name: 'id_produto', type: 'int', nullable: false })
  id_produto: number;

  @Column({ type: 'int', nullable: false, default: 1 })
  quantidade: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  preco_unitario: number;

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
