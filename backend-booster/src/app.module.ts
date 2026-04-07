import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './api/auth/auth.module';
import { UserModule } from './api/users/user.module';
import { CategoriaModule } from './api/catalog/categoria/categoria.module';
import { FabricanteModule } from './api/catalog/fabricante/fabricante.module';
import { ProdutoModule } from './api/catalog/produto/produto.module';
import { CartModule } from './api/cart/cart.module';
import { PedidoModule } from './api/pedido/pedido.module';
import { DashboardModule } from './api/dashboard/dashboard.module';
import { ChatModule } from './api/chat/chat.module';
import { ServicosModule } from './api/servicos/servicos.module';
import { AiModule } from './api/ai/ai.module';
import { EnumValidatorService } from './core/validators/enum-validator.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    UserModule,
    CategoriaModule,
    FabricanteModule,
    ProdutoModule,
    CartModule,
    PedidoModule,
    DashboardModule,
    ChatModule,
    ServicosModule,
    AiModule,
  ],
  controllers: [HealthController],
  providers: [EnumValidatorService],
})
export class AppModule {}
