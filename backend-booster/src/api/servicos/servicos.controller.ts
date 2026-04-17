import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@shared/enums/database.enums';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Get()
  async findAllServicos(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('id_tipo_servico') id_tipo_servico?: string,
  ) {
    if (cursor !== undefined || limit !== undefined || search || id_tipo_servico) {
      return this.servicosService.findAllServicosPaginated(
        limit ? Math.min(parseInt(limit), 100) : 20,
        cursor,
        search,
        id_tipo_servico ? parseInt(id_tipo_servico) : undefined,
      );
    }
    return this.servicosService.findAllServicos();
  }

  @Get('tipos')
  async findAllTipos() {
    return this.servicosService.findAllTiposServico();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicosService.findOneServico(+id);
  }

  @Post('agendamento')
  @UseGuards(JwtAuthGuard)
  async createAgendamento(
    @Body() createAgendamentoDto: CreateAgendamentoDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.servicosService.createAgendamento(createAgendamentoDto, userId);
  }

  @Get('agendamento/meus')
  @UseGuards(JwtAuthGuard)
  async findMyAgendamentos(@Request() req) {
    return this.servicosService.findMyAgendamentos(req.user.id);
  }

  @Get('agendamento')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllAgendamentos() {
    return this.servicosService.findAllAgendamentos();
  }

  @Patch('agendamento/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.servicosService.updateAgendamentoStatus(+id, body.status);
  }
}
