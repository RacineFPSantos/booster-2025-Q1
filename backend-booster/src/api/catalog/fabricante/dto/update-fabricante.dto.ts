import { PartialType } from '@nestjs/mapped-types';
import { CreateFabricanteDto } from './create-fabricante.dto';

export class UpdateFabricanteDto extends PartialType(CreateFabricanteDto) {}
