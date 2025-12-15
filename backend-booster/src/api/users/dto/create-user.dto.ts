import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { UserRole } from '@shared/enums/database.enums';
import { ApiProperty } from '@nestjs/swagger';
/**
 * DTO para criação de usuário (usado por ADMINs)
 * Permite definir a role do usuário
 */
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nome: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(11, 14, {
    message: 'Documento deve ter entre 11 (CPF) e 14 (CNPJ) caracteres',
  })
  documento: string;

  @ApiProperty()
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
