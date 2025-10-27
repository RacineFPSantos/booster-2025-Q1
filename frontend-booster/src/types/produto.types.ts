/**
 * Tipos relacionados a Produtos/Peças
 */

export interface Categoria {
  id_categoria: number;
  nome: string;
  descricao?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Fabricante {
  id_fabricante: number;
  nome: string;
  cnpj?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Produto {
  id_produto: number;
  nome: string;
  descricao: string;
  preco_unitario: number;
  id_categoria: number;
  id_fabricante: number;
  categoria?: Categoria;
  fabricante?: Fabricante;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProdutoDto {
  nome: string;
  descricao: string;
  preco_unitario: number;
  id_categoria: number;
  id_fabricante: number;
}

export interface UpdateProdutoDto {
  nome?: string;
  descricao?: string;
  preco_unitario?: number;
  id_categoria?: number;
  id_fabricante?: number;
}

export interface ProdutoFilters {
  categoria?: number;
  fabricante?: number;
  precoMin?: number;
  precoMax?: number;
  busca?: string;
}
