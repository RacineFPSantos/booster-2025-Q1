import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { TipoClienteEnum } from '@shared/enums/database.enums';

/**
 * DTO para registro público de novos usuários
 * NÃO permite definir a role (sempre será CLIENT)
 */
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nome: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 14, { message: 'Documento deve ter entre 11 (CPF) e 14 (CNPJ) caracteres' })
  documento: string;

  @IsEnum(TipoClienteEnum, { message: 'Tipo de cliente inválido. Use: PF ou PJ' })
  @IsNotEmpty()
  tipo_cliente: TipoClienteEnum;
}
