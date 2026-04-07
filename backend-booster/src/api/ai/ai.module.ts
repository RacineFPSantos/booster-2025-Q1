import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiPublicController } from './ai-public.controller';
import { AiService } from './ai.service';
import { GenkitService } from './genkit.service';
import { AiLogService } from './ai-log.service';
import { RagService } from './rag.service';
import { AiInteractionLog } from './entities/ai-interaction-log.entity';
import { AiThrottleGuard } from './guards/ai-throttle.guard';
import { Produto } from '../catalog/produto/entities/produto.entity';
import { Servico } from '../servicos/entities/servico.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiInteractionLog, Produto, Servico]),
    ConfigModule,
  ],
  controllers: [AiController, AiPublicController],
  providers: [AiService, GenkitService, AiLogService, RagService, AiThrottleGuard],
  exports: [AiService],
})
export class AiModule {}
