import { api } from "@/lib/axios";
import type {
  Produto,
  CreateProdutoDto,
  UpdateProdutoDto,
  Categoria,
  Fabricante,
} from "@/types/produto.types";

/**
 * Serviço de Produtos/Peças
 * Responsável por todas as operações relacionadas a produtos
 */
export class ProdutoService {
  /**
   * Busca todos os produtos
   */
  static async findAll(): Promise<Produto[]> {
    const response = await api.get<Produto[]>("/produto");
    return response.data;
  }

  /**
   * Busca um produto por ID
   */
  static async findOne(id: number): Promise<Produto> {
    const response = await api.get<Produto>(`/produto/${id}`);
    return response.data;
  }

  /**
   * Cria um novo produto
   */
  static async create(data: CreateProdutoDto): Promise<Produto> {
    const response = await api.post<Produto>("/produto", data);
    return response.data;
  }

  /**
   * Atualiza um produto
   */
  static async update(id: number, data: UpdateProdutoDto): Promise<Produto> {
    const response = await api.patch<Produto>(`/produto/${id}`, data);
    return response.data;
  }

  /**
   * Remove um produto
   */
  static async remove(id: number): Promise<void> {
    await api.delete(`/produto/${id}`);
  }

  /**
   * Deleta um produto (alias para remove)
   */
  static async delete(id: number): Promise<void> {
    await this.remove(id);
  }

  /**
   * Busca todas as categorias
   */
  static async findAllCategorias(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>("/categoria");
    return response.data;
  }

  /**
   * Busca todos os fabricantes
   */
  static async findAllFabricantes(): Promise<Fabricante[]> {
    const response = await api.get<Fabricante[]>("/fabricante");
    return response.data;
  }
}
