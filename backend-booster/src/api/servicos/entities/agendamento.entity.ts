import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Servico } from './servico.entity';
import { User } from '../../users/entities/user.entity';

export enum StatusAgendamento {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  CONCLUIDO = 'CONCLUIDO',
}

@Entity('agendamento')
export class Agendamento {
  @PrimaryGeneratedColumn({ name: 'id_agendamento' })
  id_agendamento: number;

  @Column({ name: 'id_servico', type: 'int', nullable: false })
  id_servico: number;

  @ManyToOne(() => Servico, (servico) => servico.agendamentos, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_servico' })
  servico: Servico;

  @Column({ name: 'id_usuario', type: 'int', nullable: true })
  id_usuario: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: User | null;

  @Column({ type: 'date', nullable: false })
  data_agendamento: Date;

  @Column({ type: 'time', nullable: false })
  hora_agendamento: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  telefone: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  veiculo: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    default: StatusAgendamento.PENDENTE,
  })
  status: StatusAgendamento;

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
