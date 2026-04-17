import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Pedido, StatusPedidoEnum } from './entities/pedido.entity';
import { PedidoItem } from './entities/pedido-item.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { CartService } from '../cart/cart.service';
import {
  CursorPage,
  encodeCursor,
  decodeCursor,
} from '../../shared/pagination/cursor-page';

const CACHE_KEY_DASHBOARD_STATS = 'dashboard:stats';
const CACHE_KEY_DASHBOARD_RECENT = 'dashboard:recent-orders';

interface PedidoCursor {
  created_at: string;
  id_pedido: number;
}

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(PedidoItem)
    private readonly pedidoItemRepository: Repository<PedidoItem>,
    private readonly cartService: CartService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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

    // Invalidar cache do dashboard
    await Promise.all([
      this.cacheManager.del(CACHE_KEY_DASHBOARD_STATS),
      this.cacheManager.del(CACHE_KEY_DASHBOARD_RECENT),
    ]);

    return savedPedido;
  }

  /**
   * Busca todos os pedidos (apenas ADMIN)
   */
  async findAll(): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      order: { created_at: 'DESC' },
      relations: ['usuario'],
    });
  }

  async findAllPaginated(
    limit = 20,
    cursor?: string,
  ): Promise<CursorPage<Pedido>> {
    const qb = this.pedidoRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.usuario', 'usuario')
      .orderBy('p.created_at', 'DESC')
      .addOrderBy('p.id_pedido', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const { created_at, id_pedido } = decodeCursor<PedidoCursor>(cursor);
      qb.where(
        '(p.created_at < :created_at) OR (p.created_at = :created_at AND p.id_pedido < :id_pedido)',
        { created_at, id_pedido },
      );
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const last = data[data.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor({
            created_at: last.created_at.toISOString(),
            id_pedido: last.id_pedido,
          })
        : null;

    return { data, nextCursor, hasMore, limit };
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

  async findMyOrdersPaginated(
    userId: number,
    limit = 20,
    cursor?: string,
  ): Promise<CursorPage<Pedido>> {
    const qb = this.pedidoRepository
      .createQueryBuilder('p')
      .where('p.id_cliente = :userId', { userId })
      .orderBy('p.created_at', 'DESC')
      .addOrderBy('p.id_pedido', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const { created_at, id_pedido } = decodeCursor<PedidoCursor>(cursor);
      qb.andWhere(
        '(p.created_at < :created_at) OR (p.created_at = :created_at AND p.id_pedido < :id_pedido)',
        { created_at, id_pedido },
      );
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const last = data[data.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor({
            created_at: last.created_at.toISOString(),
            id_pedido: last.id_pedido,
          })
        : null;

    return { data, nextCursor, hasMore, limit };
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

    const saved = await this.pedidoRepository.save(pedido);

    await Promise.all([
      this.cacheManager.del(CACHE_KEY_DASHBOARD_STATS),
      this.cacheManager.del(CACHE_KEY_DASHBOARD_RECENT),
    ]);

    return saved;
  }
}
