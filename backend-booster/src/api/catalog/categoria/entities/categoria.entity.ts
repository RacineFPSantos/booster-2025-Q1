import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Produto } from '../../produto/entities/produto.entity';

@Entity()
export class Categoria {
  @PrimaryGeneratedColumn()
  id_categoria: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nome: string;

  @OneToMany(() => Produto, (produto) => produto.categoria)
  produtos: Produto[];
}
