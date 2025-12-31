import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoStatusDto } from './dto/update-pedido-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/database.enums';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  /**
   * POST /pedidos
   * Cria um novo pedido
   */
  @Post()
  async create(@Request() req, @Body() dto: CreatePedidoDto) {
    return this.pedidoService.create(req.user.id, dto);
  }

  /**
   * GET /pedidos/admin/all
   * Busca todos os pedidos (apenas ADMIN)
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.pedidoService.findAll();
  }

  /**
   * GET /pedidos/my-orders
   * Busca todos os pedidos do usuário autenticado
   */
  @Get('my-orders')
  async findMyOrders(@Request() req) {
    return this.pedidoService.findMyOrders(req.user.id);
  }

  /**
   * GET /pedidos/:id
   * Busca um pedido específico
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.pedidoService.findOne(parseInt(id), req.user.id);
  }

  /**
   * PATCH /pedidos/:id/cancel
   * Cancela um pedido
   */
  @Patch(':id/cancel')
  async cancel(@Request() req, @Param('id') id: string) {
    return this.pedidoService.cancel(parseInt(id), req.user.id);
  }

  /**
   * PATCH /pedidos/:id/status
   * Atualiza o status de um pedido (apenas ADMIN)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePedidoStatusDto,
  ) {
    return this.pedidoService.updateStatus(parseInt(id), dto.status);
  }
}
