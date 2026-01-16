import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';
import { Servico } from './entities/servico.entity';
import { TipoServico } from './entities/tipo-servico.entity';
import { Agendamento } from './entities/agendamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Servico, TipoServico, Agendamento])],
  controllers: [ServicosController],
  providers: [ServicosService],
  exports: [ServicosService],
})
export class ServicosModule {}
