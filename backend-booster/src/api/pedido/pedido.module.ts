import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';
import { Pedido } from './entities/pedido.entity';
import { PedidoItem } from './entities/pedido-item.entity';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoItem]), CartModule],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService],
})
export class PedidoModule {}
