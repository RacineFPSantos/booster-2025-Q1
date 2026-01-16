import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servico } from './entities/servico.entity';
import { TipoServico } from './entities/tipo-servico.entity';
import { Agendamento, StatusAgendamento } from './entities/agendamento.entity';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';

@Injectable()
export class ServicosService {
  constructor(
    @InjectRepository(Servico)
    private readonly servicoRepository: Repository<Servico>,
    @InjectRepository(TipoServico)
    private readonly tipoServicoRepository: Repository<TipoServico>,
    @InjectRepository(Agendamento)
    private readonly agendamentoRepository: Repository<Agendamento>,
  ) {}

  /**
   * Lista todos os serviços ativos
   */
  async findAllServicos(): Promise<Servico[]> {
    return this.servicoRepository.find({
      where: { ativo: true },
      relations: ['tipo_servico'],
      order: { nome: 'ASC' },
    });
  }

  /**
   * Busca um serviço por ID
   */
  async findOneServico(id: number): Promise<Servico> {
    const servico = await this.servicoRepository.findOne({
      where: { id_servico: id },
      relations: ['tipo_servico'],
    });

    if (!servico) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }

    return servico;
  }

  /**
   * Lista todos os tipos de serviço
   */
  async findAllTiposServico(): Promise<TipoServico[]> {
    return this.tipoServicoRepository.find({
      order: { nome: 'ASC' },
    });
  }

  /**
   * Cria um novo agendamento
   */
  async createAgendamento(
    dto: CreateAgendamentoDto,
    userId?: number,
  ): Promise<Agendamento> {
    const agendamento = this.agendamentoRepository.create({
      id_servico: dto.id_servico,
      id_usuario: userId || null,
      data_agendamento: new Date(dto.data_agendamento),
      hora_agendamento: dto.hora_agendamento,
      telefone: dto.telefone,
      veiculo: dto.veiculo,
      observacoes: dto.observacoes,
    });

    return this.agendamentoRepository.save(agendamento);
  }

  /**
   * Lista agendamentos do usuário
   */
  async findMyAgendamentos(userId: number): Promise<Agendamento[]> {
    return this.agendamentoRepository.find({
      where: { id_usuario: userId },
      relations: ['servico', 'servico.tipo_servico'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Lista todos os agendamentos (Admin)
   */
  async findAllAgendamentos(): Promise<Agendamento[]> {
    return this.agendamentoRepository.find({
      relations: ['servico', 'usuario'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Atualiza status do agendamento
   */
  async updateAgendamentoStatus(
    id: number,
    status: string,
  ): Promise<Agendamento> {
    await this.agendamentoRepository.update(
      { id_agendamento: id },
      { status: status as StatusAgendamento },
    );

    const agendamento = await this.agendamentoRepository.findOne({
      where: { id_agendamento: id },
      relations: ['servico'],
    });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    return agendamento;
  }
}
