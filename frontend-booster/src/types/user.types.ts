/**
 * Tipos relacionados a Usuários
 */

export enum UserRole {
  CLIENT = "CLIENT",
  ADMIN = "ADMIN",
}

export interface User {
  id_usuario: number;
  nome: string;
  email: string;
  documento: string;
  tipo_usuario: UserRole;
  usuario_role: UserRole;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateUserDto {
  nome: string;
  email: string;
  senha: string;
  documento: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  nome?: string;
  email?: string;
  documento?: string;
}

export interface UserStats {
  total: number;
  clientes: number;
  admins: number;
  ativos: number;
  inativos: number;
  novosEsteMes: number;
}
