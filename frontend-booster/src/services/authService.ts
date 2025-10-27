import { api } from '@/lib/axios';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth.types';

/**
 * Serviço de Autenticação
 * Responsável por todas as operações relacionadas a login, registro e autenticação
 */
export class AuthService {
  /**
   * Faz login do usuário
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    // Salvar token e dados do usuário no localStorage
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  }

  /**
   * Registra um novo usuário (sempre como CLIENT)
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    // Salvar token e dados do usuário no localStorage
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  }

  /**
   * Faz logout do usuário
   */
  static logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  /**
   * Verifica se o usuário está autenticado
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Retorna o usuário logado (do localStorage)
   */
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Retorna o token de acesso
   */
  static getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Busca o perfil do usuário logado (do servidor)
   */
  static async getProfile(): Promise<User> {
    const response = await api.get<{ user: User }>('/user/me/profile');
    return response.data.user;
  }
}
