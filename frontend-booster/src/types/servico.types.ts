export interface TipoServico {
  id_tipo_servico: number;
  nome: string;
  descricao: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Servico {
  id_servico: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao_estimada: number;
  id_tipo_servico: number;
  ativo: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
  tipo_servico?: TipoServico;
}

export enum StatusAgendamento {
  PENDENTE = "PENDENTE",
  CONFIRMADO = "CONFIRMADO",
  REALIZADO = "REALIZADO",
  CANCELADO = "CANCELADO",
}

export interface Agendamento {
  id_agendamento: number;
  id_servico: number;
  id_usuario?: number;
  data_agendamento: Date | string;
  hora_agendamento: string;
  nome_cliente: string;
  telefone: string;
  veiculo: string;
  observacoes?: string;
  status: StatusAgendamento;
  created_at?: Date | string;
  updated_at?: Date | string;
  servico?: Servico;
  usuario?: {
    nome?: string;
    email?: string;
  };
}

export interface CreateAgendamentoDto {
  id_servico: number;
  data_agendamento: string;
  hora_agendamento: string;
  nome_cliente: string;
  telefone: string;
  veiculo: string;
  observacoes?: string;
}
