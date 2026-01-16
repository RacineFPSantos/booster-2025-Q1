import { api } from "@/lib/axios";
import type {
  Servico,
  TipoServico,
  Agendamento,
  CreateAgendamentoDto,
} from "@/types/servico.types";

export class ServicoService {
  /**
   * Lista todos os serviços ativos
   */
  static async findAll(): Promise<Servico[]> {
    const response = await api.get<Servico[]>("/servicos");
    return response.data;
  }

  /**
   * Busca um serviço por ID
   */
  static async findOne(id: number): Promise<Servico> {
    const response = await api.get<Servico>(`/servicos/${id}`);
    return response.data;
  }

  /**
   * Lista todos os tipos de serviço
   */
  static async findAllTipos(): Promise<TipoServico[]> {
    const response = await api.get<TipoServico[]>("/servicos/tipos");
    return response.data;
  }

  /**
   * Cria um novo agendamento
   */
  static async createAgendamento(
    data: CreateAgendamentoDto,
  ): Promise<Agendamento> {
    const response = await api.post<Agendamento>("/servicos/agendamento", data);
    return response.data;
  }

  /**
   * Lista os agendamentos do usuário logado
   */
  static async findMyAgendamentos(): Promise<Agendamento[]> {
    const response = await api.get<Agendamento[]>("/servicos/agendamento/meus");
    return response.data;
  }

  /**
   * Lista todos os agendamentos (apenas ADMIN)
   */
  static async findAllAgendamentos(): Promise<Agendamento[]> {
    const response = await api.get<Agendamento[]>("/servicos/agendamento");
    return response.data;
  }

  /**
   * Atualiza o status de um agendamento (apenas ADMIN)
   */
  static async updateStatus(id: number, status: string): Promise<Agendamento> {
    const response = await api.patch<Agendamento>(
      `/servicos/agendamento/${id}/status`,
      { status },
    );
    return response.data;
  }
}
