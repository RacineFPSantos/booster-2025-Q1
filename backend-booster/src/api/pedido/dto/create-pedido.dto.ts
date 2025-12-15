import { IsArray, IsInt, IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePedidoItemDto {
  @IsInt()
  @IsPositive()
  id_produto: number;

  @IsInt()
  @IsPositive()
  quantidade: number;

  @IsNumber()
  @IsPositive()
  preco_unitario: number;
}

export class CreatePedidoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoItemDto)
  items: CreatePedidoItemDto[];
}
