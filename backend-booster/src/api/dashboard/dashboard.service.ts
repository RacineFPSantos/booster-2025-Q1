import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Repository, LessThan } from 'typeorm';
import { Pedido } from '../pedido/entities/pedido.entity';
import { Produto } from '../catalog/produto/entities/produto.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../shared/enums/database.enums';

const CACHE_TTL_STATS = 15 * 60 * 1000; // 15 minutos em ms
const CACHE_TTL_RECENT_ORDERS = 2 * 60 * 1000; // 2 minutos em ms
const CACHE_KEY_STATS = 'dashboard:stats';
const CACHE_KEY_RECENT_ORDERS = 'dashboard:recent-orders';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Retorna estatísticas gerais do sistema
   */
  async getStats() {
    const cached = await this.cacheManager.get(CACHE_KEY_STATS);
    if (cached) return cached;

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total de vendas do mês atual
    const salesThisMonth = await this.pedidoRepository
      .createQueryBuilder('pedido')
      .select('SUM(pedido.valor_total)', 'total')
      .where('pedido.created_at >= :thisMonth', { thisMonth })
      .andWhere("pedido.status != 'CANCELADO'")
      .getRawOne();

    // Total de vendas do mês passado
    const salesLastMonth = await this.pedidoRepository
      .createQueryBuilder('pedido')
      .select('SUM(pedido.valor_total)', 'total')
      .where('pedido.created_at >= :lastMonth', { lastMonth })
      .andWhere('pedido.created_at < :thisMonth', { thisMonth })
      .andWhere("pedido.status != 'CANCELADO'")
      .getRawOne();

    // Total de pedidos
    const totalOrders = await this.pedidoRepository.count();
    const ordersThisMonth = await this.pedidoRepository.count({
      where: {
        created_at: LessThan(thisMonth) as any,
      },
    });

    // Total de produtos
    const totalProducts = await this.produtoRepository.count();

    // Total de clientes
    const totalClients = await this.userRepository.count({
      where: { usuario_role: UserRole.CLIENT },
    });

    // Calcular variações percentuais
    const salesChange = this.calculatePercentChange(
      parseFloat(salesLastMonth?.total || 0),
      parseFloat(salesThisMonth?.total || 0),
    );

    const ordersChange = this.calculatePercentChange(
      ordersThisMonth,
      totalOrders - ordersThisMonth,
    );

    const result = {
      sales: {
        total: parseFloat(salesThisMonth?.total || 0),
        change: salesChange,
      },
      orders: {
        total: totalOrders,
        change: ordersChange,
      },
      products: {
        total: totalProducts,
        change: 0,
      },
      clients: {
        total: totalClients,
        change: 0,
      },
    };

    await this.cacheManager.set(CACHE_KEY_STATS, result, CACHE_TTL_STATS);
    return result;
  }

  /**
   * Retorna os pedidos recentes (últimos 10)
   */
  async getRecentOrders() {
    const cached = await this.cacheManager.get(CACHE_KEY_RECENT_ORDERS);
    if (cached) return cached;

    const orders = await this.pedidoRepository.find({
      take: 10,
      order: { created_at: 'DESC' },
      relations: ['usuario'],
    });

    await this.cacheManager.set(CACHE_KEY_RECENT_ORDERS, orders, CACHE_TTL_RECENT_ORDERS);
    return orders;
  }

  /**
   * Retorna produtos com estoque baixo (menos de 10 unidades)
   * Nota: Como não existe tabela de estoque separada, retornamos lista vazia
   */
  async getLowStockProducts() {
    // TODO: Implementar quando houver tabela de estoque
    return [];
  }

  /**
   * Calcula a variação percentual entre dois valores
   */
  private calculatePercentChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return Number((((newValue - oldValue) / oldValue) * 100).toFixed(1));
  }
}
