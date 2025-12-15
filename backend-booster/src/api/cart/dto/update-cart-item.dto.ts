import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantidade: number;
}
