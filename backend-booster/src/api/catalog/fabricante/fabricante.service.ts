import { Injectable } from '@nestjs/common';
import { CreateFabricanteDto } from './dto/create-fabricante.dto';
import { UpdateFabricanteDto } from './dto/update-fabricante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityManager } from 'typeorm';
import { Fabricante } from './entities/fabricante.entity';

@Injectable()
export class FabricanteService {
  constructor(
    @InjectRepository(Fabricante)
    private readonly fabricanteRepository: Repository<Fabricante>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createFabricanteDto: CreateFabricanteDto) {
    const fabricante = this.fabricanteRepository.create(createFabricanteDto);
    return this.entityManager.save(fabricante);
  }

  async findAll() {
    return this.fabricanteRepository.find();
  }

  async findOne(id: number) {
    return this.fabricanteRepository.findOneBy({ id_fabricante: id });
  }

  async update(id: number, updateFabricanteDto: UpdateFabricanteDto) {
    return await this.fabricanteRepository.update(
      { id_fabricante: id },
      updateFabricanteDto,
    );
  }

  async remove(id: number) {
    await this.fabricanteRepository.delete({ id_fabricante: id });
  }
}
