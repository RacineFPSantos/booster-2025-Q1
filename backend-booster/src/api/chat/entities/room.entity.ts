import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customer_id: string;

  @Column({ type: 'varchar', nullable: true })
  admin_id?: string;

  @Column({
    type: 'varchar',
    default: 'waiting',
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
