import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Pedido } from '../pedido/entities/pedido.entity';
import { Produto } from '../catalog/produto/entities/produto.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../shared/enums/database.enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Retorna estatísticas gerais do sistema
   */
  async getStats() {
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
      where: { tipo_usuario: UserRole.CLIENT },
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

    return {
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
        change: 0, // Pode implementar lógica de variação depois
      },
      clients: {
        total: totalClients,
        change: 0, // Pode implementar lógica de variação depois
      },
    };
  }

  /**
   * Retorna os pedidos recentes (últimos 10)
   */
  async getRecentOrders() {
    return this.pedidoRepository.find({
      take: 10,
      order: { created_at: 'DESC' },
      relations: ['usuario'],
    });
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
