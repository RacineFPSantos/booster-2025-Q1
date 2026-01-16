import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Servico } from './servico.entity';

@Entity('tipo_servico')
export class TipoServico {
  @PrimaryGeneratedColumn({ name: 'id_tipo_servico' })
  id_tipo_servico: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @OneToMany(() => Servico, (servico) => servico.tipo_servico)
  servicos: Servico[];

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
