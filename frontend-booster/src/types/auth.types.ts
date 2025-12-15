/**
 * Tipos relacionados à autenticação
 */

export const enum UserRole {
  CLIENT = "CLIENT",
  ADMIN = "ADMIN",
}

export const enum TipoClienteEnum {
  PF = "PF",
  PJ = "PJ",
}

export interface User {
  id: number;
  email: string;
  nome: string;
  role: UserRole;
  tipo_cliente?: TipoClienteEnum;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  documento: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
