import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './api/auth/auth.module';
import { UserModule } from './api/users/user.module';
import { CategoriaModule } from './api/catalog/categoria/categoria.module';
import { FabricanteModule } from './api/catalog/fabricante/fabricante.module';
import { ProdutoModule } from './api/catalog/produto/produto.module';
import { CartModule } from './api/cart/cart.module';
import { PedidoModule } from './api/pedido/pedido.module';
import { EnumValidatorService } from './core/validators/enum-validator.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
    CategoriaModule,
    FabricanteModule,
    ProdutoModule,
    CartModule,
    PedidoModule,
  ],
  controllers: [],
  providers: [EnumValidatorService],
})
export class AppModule {}
