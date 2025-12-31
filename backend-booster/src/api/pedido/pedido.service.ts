import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, StatusPedidoEnum } from './entities/pedido.entity';
import { PedidoItem } from './entities/pedido-item.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(PedidoItem)
    private readonly pedidoItemRepository: Repository<PedidoItem>,
    private readonly cartService: CartService,
  ) {}

  /**
   * Cria um novo pedido a partir do carrinho
   */
  async create(userId: number, dto: CreatePedidoDto): Promise<Pedido> {
    // Calcular valor total
    const valorTotal = dto.items.reduce(
      (sum, item) => sum + Number(item.preco_unitario) * item.quantidade,
      0,
    );

    // Criar pedido
    const pedido = this.pedidoRepository.create({
      id_cliente: userId,
      id_usuario: userId,
      valor_total: valorTotal,
      status: StatusPedidoEnum.PENDENTE,
      items: dto.items.map((item) =>
        this.pedidoItemRepository.create({
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        }),
      ),
    });

    const savedPedido = await this.pedidoRepository.save(pedido);

    // Limpar carrinho após criar pedido
    await this.cartService.clearCart(userId);

    return savedPedido;
  }

  /**
   * Busca todos os pedidos (apenas ADMIN)
   */
  async findAll(): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      order: { created_at: 'DESC' },
      relations: ['cliente'],
    });
  }

  /**
   * Busca todos os pedidos do usuário
   */
  async findMyOrders(userId: number): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      where: { id_cliente: userId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Busca um pedido específico
   */
  async findOne(id: number, userId: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id_pedido: id, id_cliente: userId },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return pedido;
  }

  /**
   * Cancela um pedido
   */
  async cancel(id: number, userId: number): Promise<Pedido> {
    const pedido = await this.findOne(id, userId);

    if (pedido.status !== StatusPedidoEnum.PENDENTE) {
      throw new Error('Apenas pedidos pendentes podem ser cancelados');
    }

    pedido.status = StatusPedidoEnum.CANCELADO;
    pedido.updated_at = new Date();

    return this.pedidoRepository.save(pedido);
  }

  /**
   * Atualiza o status de um pedido (apenas ADMIN)
   */
  async updateStatus(id: number, status: StatusPedidoEnum): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id_pedido: id },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    pedido.status = status;
    pedido.updated_at = new Date();

    return this.pedidoRepository.save(pedido);
  }
}
