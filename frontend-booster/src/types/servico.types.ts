/**
 * Tipos relacionados a Serviços
 */

export interface TipoServico {
  id_tipo_servico: number;
  nome: string;
  descricao?: string;
}

export interface Servico {
  id_servico: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao_estimada: number; // em minutos
  id_tipo_servico: number;
  tipo_servico?: TipoServico;
  created_at?: Date;
  updated_at?: Date;
}

export interface ServicoFilters {
  tipo?: number;
  precoMin?: number;
  precoMax?: number;
  busca?: string;
}
