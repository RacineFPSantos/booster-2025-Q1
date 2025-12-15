import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FabricanteService } from './fabricante.service';
import { CreateFabricanteDto } from './dto/create-fabricante.dto';
import { UpdateFabricanteDto } from './dto/update-fabricante.dto';

@Controller('fabricante')
export class FabricanteController {
  constructor(private readonly fabricanteService: FabricanteService) {}

  @Post()
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
  update(
    @Param('id') id: string,
    @Body() updateFabricanteDto: UpdateFabricanteDto,
  ) {
    return this.fabricanteService.update(+id, updateFabricanteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fabricanteService.remove(+id);
  }
}
