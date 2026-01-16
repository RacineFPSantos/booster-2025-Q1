import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TipoServico } from './tipo-servico.entity';
import { Agendamento } from './agendamento.entity';

@Entity('servico')
export class Servico {
  @PrimaryGeneratedColumn({ name: 'id_servico' })
  id_servico: number;

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
  preco: number;

  @Column({ type: 'int', nullable: false })
  duracao_estimada: number;

  @Column({ name: 'id_tipo_servico', type: 'int', nullable: false })
  id_tipo_servico: number;

  @ManyToOne(() => TipoServico, (tipo) => tipo.servicos, { nullable: false })
  @JoinColumn({ name: 'id_tipo_servico' })
  tipo_servico: TipoServico;

  @Column({ type: 'boolean', nullable: false, default: true })
  ativo: boolean;

  @OneToMany(() => Agendamento, (agendamento) => agendamento.servico)
  agendamentos: Agendamento[];

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
