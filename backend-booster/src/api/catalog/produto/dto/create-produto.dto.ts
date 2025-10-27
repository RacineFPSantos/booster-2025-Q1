import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  MaxLength,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsPositive()
  preco_unitario: number;

  @IsInt()
  @IsPositive()
  id_categoria: number;

  @IsInt()
  @IsPositive()
  id_fabricante: number;
}
