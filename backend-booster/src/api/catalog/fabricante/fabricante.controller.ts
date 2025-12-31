import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FabricanteService } from './fabricante.service';
import { CreateFabricanteDto } from './dto/create-fabricante.dto';
import { UpdateFabricanteDto } from './dto/update-fabricante.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../shared/enums/database.enums';

@Controller('fabricante')
export class FabricanteController {
  constructor(private readonly fabricanteService: FabricanteService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createFabricanteDto: CreateFabricanteDto) {
    return this.fabricanteService.create(createFabricanteDto);
  }

  @Get()
  findAll() {
    return this.fabricanteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fabricanteService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateFabricanteDto: UpdateFabricanteDto,
  ) {
    return this.fabricanteService.update(+id, updateFabricanteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.fabricanteService.remove(+id);
  }
}
