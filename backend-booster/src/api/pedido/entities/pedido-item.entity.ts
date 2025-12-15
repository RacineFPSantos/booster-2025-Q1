import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Produto } from '../../catalog/produto/entities/produto.entity';

@Entity('pedido_item')
export class PedidoItem {
  @PrimaryGeneratedColumn({ name: 'id_pedido_item' })
  id_pedido_item: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @Column({ name: 'id_pedido', type: 'int', nullable: false })
  id_pedido: number;

  @ManyToOne(() => Produto, { eager: true, nullable: true })
  @JoinColumn({ name: 'id_produto' })
  produto: Produto;

  @Column({ name: 'id_produto', type: 'int', nullable: true })
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
}
