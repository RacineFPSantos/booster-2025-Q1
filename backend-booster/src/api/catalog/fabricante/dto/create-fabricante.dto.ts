import { IsString, IsNotEmpty, MaxLength, Length } from 'class-validator';

export class CreateFabricanteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Length(14, 14, { message: 'CNPJ deve ter exatamente 14 dígitos' })
  cnpj: string;
}
