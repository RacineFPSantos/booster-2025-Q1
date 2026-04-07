import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('ai_interaction_log')
export class AiInteractionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  session_id: string | null;

  @Column({ type: 'text' })
  prompt_text: string;

  @Column({ type: 'varchar', length: 20 })
  system_prompt_version: string;

  @Column({ type: 'text' })
  response_text: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  intent_detected: string | null;

  @Column({ type: 'int', nullable: true })
  input_tokens: number | null;

  @Column({ type: 'int', nullable: true })
  output_tokens: number | null;

  @Column({ type: 'int', nullable: true })
  total_tokens: number | null;

  @Column({ type: 'varchar', length: 100 })
  model_used: string;

  @Column({ type: 'int' })
  latency_ms: number;

  @Column({ type: 'boolean', default: false })
  was_filtered: boolean;

  @CreateDateColumn()
  created_at: Date;
}
