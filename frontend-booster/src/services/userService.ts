import { api } from "@/lib/axios";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserStats,
  UserRole,
} from "@/types/user.types";

/**
 * Serviço de Usuários
 * Responsável por todas as operações relacionadas a usuários (Admin apenas)
 */
export class UserService {
  /**
   * Busca todos os usuários
   */
  static async findAll(): Promise<User[]> {
    const response = await api.get<User[]>("/user");
    return response.data;
  }

  /**
   * Busca um usuário por ID
   */
  static async findOne(id: number): Promise<User> {
    const response = await api.get<User>(`/user/${id}`);
    return response.data;
  }

  /**
   * Cria um novo usuário
   */
  static async create(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>("/user", data);
    return response.data;
  }

  /**
   * Atualiza um usuário
   */
  static async update(id: number, data: UpdateUserDto): Promise<User> {
    const response = await api.patch<User>(`/user/${id}`, data);
    return response.data;
  }

  /**
   * Atualiza o role de um usuário
   */
  static async updateRole(id: number, role: UserRole): Promise<User> {
    const response = await api.patch<User>(`/user/${id}/role`, { role });
    return response.data;
  }

  /**
   * Ativa ou desativa um usuário
   */
  static async updateStatus(id: number, isActive: boolean): Promise<User> {
    const response = await api.patch<User>(`/user/${id}/status`, {
      is_active: isActive,
    });
    return response.data;
  }

  /**
   * Remove um usuário (soft delete)
   */
  static async remove(id: number): Promise<void> {
    await api.delete(`/user/${id}`);
  }

  /**
   * Deleta um usuário (alias para remove)
   */
  static async delete(id: number): Promise<void> {
    await this.remove(id);
  }

  /**
   * Busca estatísticas dos usuários
   */
  static async getStats(): Promise<UserStats> {
    const response = await api.get<UserStats>("/user/stats");
    return response.data;
  }
}
