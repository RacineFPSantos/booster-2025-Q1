import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateAgendamentoDto {
  @IsInt()
  @IsNotEmpty()
  id_servico: number;

  @IsString()
  @IsNotEmpty()
  data_agendamento: string;

  @IsString()
  @IsNotEmpty()
  hora_agendamento: string;

  @IsString()
  @IsNotEmpty()
  telefone: string;

  @IsString()
  @IsNotEmpty()
  veiculo: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
