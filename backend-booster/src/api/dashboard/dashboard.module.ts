import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Pedido } from '../pedido/entities/pedido.entity';
import { Produto } from '../catalog/produto/entities/produto.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, Produto, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
