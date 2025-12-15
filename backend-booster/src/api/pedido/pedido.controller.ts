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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
