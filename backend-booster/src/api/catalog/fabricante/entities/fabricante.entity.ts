import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Produto } from '../../produto/entities/produto.entity';

@Entity()
export class Fabricante {
  @PrimaryGeneratedColumn()
  id_fabricante: number;

  @Column({ type: 'varchar', length: 14, unique: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nome: string;

  @OneToMany(() => Produto, (produto) => produto.fabricante)
  produtos: Produto[];
}
