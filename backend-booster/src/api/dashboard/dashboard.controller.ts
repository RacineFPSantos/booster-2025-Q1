import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/database.enums';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/stats
   * Retorna estatísticas gerais do sistema
   */
  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  /**
   * GET /dashboard/recent-orders
   * Retorna os pedidos recentes
   */
  @Get('recent-orders')
  async getRecentOrders() {
    return this.dashboardService.getRecentOrders();
  }

  /**
   * GET /dashboard/low-stock
   * Retorna produtos com estoque baixo
   */
  @Get('low-stock')
  async getLowStock() {
    return this.dashboardService.getLowStockProducts();
  }
}
