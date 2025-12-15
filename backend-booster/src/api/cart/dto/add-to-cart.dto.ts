import { IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  id_produto: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantidade: number;
}
