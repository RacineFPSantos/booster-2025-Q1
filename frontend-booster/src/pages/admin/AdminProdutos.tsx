import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProdutoService } from "@/services/produtoService";
import { ProdutoModal } from "@/components/admin/ProdutoModal";
import type { Produto, Categoria, Fabricante } from "@/types/produto.types";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Package,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    aplicarFiltro();
  }, [busca, produtos]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [produtosData, categoriasData, fabricantesData] = await Promise.all(
        [
          ProdutoService.findAll(),
          ProdutoService.findAllCategorias(),
          ProdutoService.findAllFabricantes(),
        ],
      );

      setProdutos(produtosData);
      setProdutosFiltrados(produtosData);
      setCategorias(categoriasData);
      setFabricantes(fabricantesData);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltro = () => {
    if (!busca) {
      setProdutosFiltrados(produtos);
      return;
    }

    const buscaLower = busca.toLowerCase();
    const filtrados = produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(buscaLower) ||
        p.descricao?.toLowerCase().includes(buscaLower),
    );
    setProdutosFiltrados(filtrados);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await ProdutoService.delete(id);
      toast.success("Produto excluído com sucesso");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast.error("Erro ao excluir produto");
    }
  };

  const handleNovoProduto = () => {
    setProdutoEditando(null);
    setIsModalOpen(true);
  };

  const handleEditarProduto = (produto: Produto) => {
    setProdutoEditando(produto);
    setIsModalOpen(true);
  };

  const handleSaveProduto = async (data: any) => {
    try {
      if (produtoEditando) {
        await ProdutoService.update(produtoEditando.id_produto, data);
        toast.success("Produto atualizado com sucesso");
      } else {
        await ProdutoService.create(data);
        toast.success("Produto criado com sucesso");
      }
      loadData();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto");
      throw error;
    }
  };

  const getCategoriaNome = (id: number) => {
    return categorias.find((c) => c.id_categoria === id)?.nome || "N/A";
  };

  const getFabricanteNome = (id: number) => {
    return fabricantes.find((f) => f.id_fabricante === id)?.nome || "N/A";
  };

  const getEstoqueStatus = (quantidade?: number) => {
    if (!quantidade || quantidade === 0) {
      return { label: "Sem estoque", color: "text-red-600 bg-red-50" };
    }
    if (quantidade < 10) {
      return { label: "Estoque baixo", color: "text-orange-600 bg-orange-50" };
    }
    return { label: "Em estoque", color: "text-green-600 bg-green-50" };
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Carregando produtos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Gestão de Produtos
            </h1>
            <p className="text-slate-600 mt-1">
              Gerencie o catálogo de produtos
            </p>
          </div>
          <Button className="gap-2" onClick={handleNovoProduto}>
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total de Produtos</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {produtos.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Em Estoque</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {
                      produtos.filter((p) => (p.estoque?.quantidade || 0) > 0)
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {
                      produtos.filter(
                        (p) =>
                          (p.estoque?.quantidade || 0) > 0 &&
                          (p.estoque?.quantidade || 0) < 10,
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  className="pl-10"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos ({produtosFiltrados.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {produtosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-slate-500">
                  {busca
                    ? "Tente ajustar sua busca"
                    : "Comece adicionando produtos ao catálogo"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Produto
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Categoria
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Fabricante
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Preço
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Estoque
                      </th>
                      <th className="text-right p-4 font-semibold text-slate-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados.map((produto) => {
                      const estoqueStatus = getEstoqueStatus(
                        produto.estoque?.quantidade,
                      );
                      return (
                        <tr
                          key={produto.id_produto}
                          className="border-b hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {produto.nome}
                              </p>
                              {produto.descricao && (
                                <p className="text-sm text-slate-500 truncate max-w-xs">
                                  {produto.descricao}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">
                            {getCategoriaNome(produto.id_categoria)}
                          </td>
                          <td className="p-4 text-slate-600">
                            {getFabricanteNome(produto.id_fabricante)}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-900">
                              R$ {produto.preco.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${estoqueStatus.color}`}
                            >
                              {produto.estoque?.quantidade || 0} un.
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleEditarProduto(produto)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(produto.id_produto)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ProdutoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        produto={produtoEditando}
        categorias={categorias}
        fabricantes={fabricantes}
        onSave={handleSaveProduto}
      />
    </AdminLayout>
  );
}
