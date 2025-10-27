import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { TipoClienteEnum, UserRole } from '@shared/enums/database.enums';

/**
 * DTO para criação de usuário (usado por ADMINs)
 * Permite definir a role do usuário
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 14, {
    message: 'Documento deve ter entre 11 (CPF) e 14 (CNPJ) caracteres',
  })
  documento: string;

  @IsEnum(TipoClienteEnum)
  @IsNotEmpty()
  tipo_cliente: TipoClienteEnum;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
