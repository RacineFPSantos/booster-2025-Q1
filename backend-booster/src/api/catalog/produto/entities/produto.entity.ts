import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Fabricante } from '../../fabricante/entities/fabricante.entity';

@Entity()
export class Produto {
  @PrimaryGeneratedColumn()
  id_produto: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  preco_unitario: number;

  @ManyToOne(() => Categoria, { nullable: false })
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @Column({ type: 'int', nullable: false })
  id_categoria: number;

  @ManyToOne(() => Fabricante, { nullable: false })
  @JoinColumn({ name: 'id_fabricante' })
  fabricante: Fabricante;

  @Column({ type: 'int', nullable: false })
  id_fabricante: number;

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
