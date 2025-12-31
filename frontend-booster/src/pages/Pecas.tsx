import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { ProdutoCard } from "@/components/cards/ProdutoCard";
import { ProdutoService } from "@/services/produtoService";
import type { Produto, Categoria, Fabricante } from "@/types/produto.types";
import { Search, Filter, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

export function Pecas() {
  const [searchParams] = useSearchParams();
  const { addProduto } = useCart();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const [fabricanteFiltro, setFabricanteFiltro] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [busca, categoriaFiltro, fabricanteFiltro, produtos]);

  // Aplicar filtros da URL quando os dados são carregados
  useEffect(() => {
    // Aplicar busca da URL
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setBusca(searchQuery);
    }

    // Aplicar filtro de categoria da URL
    if (categorias.length > 0) {
      const categoriaNome = searchParams.get("categoria");
      if (categoriaNome) {
        // Normalizar: remover acentos e converter para maiúsculas para comparação
        const normalizarString = (str: string) => {
          return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
        };

        const categoriaNormalizada = normalizarString(categoriaNome);

        const categoriaEncontrada = categorias.find(
          (cat) => normalizarString(cat.nome) === categoriaNormalizada,
        );

        if (categoriaEncontrada) {
          setCategoriaFiltro(String(categoriaEncontrada.id_categoria));
        }
      }
    }
  }, [categorias, searchParams]);

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
      toast.error("Erro ao carregar produtos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...produtos];

    // Filtro de busca por nome ou descrição
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.nome.toLowerCase().includes(buscaLower) ||
          p.descricao?.toLowerCase().includes(buscaLower),
      );
    }

    // Filtro por categoria
    if (categoriaFiltro) {
      resultado = resultado.filter(
        (p) => p.id_categoria === Number(categoriaFiltro),
      );
    }

    // Filtro por fabricante
    if (fabricanteFiltro) {
      resultado = resultado.filter(
        (p) => p.id_fabricante === Number(fabricanteFiltro),
      );
    }

    setProdutosFiltrados(resultado);
  };

  const limparFiltros = () => {
    setBusca("");
    setCategoriaFiltro("");
    setFabricanteFiltro("");
  };

  const handleAddToCart = (produto: Produto) => {
    addProduto(produto, 1);
  };

  if (isLoading) {
    return (
      <>
        <Toaster />
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Carregando peças...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster />
      <Header />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Catálogo de Peças
            {categoriaFiltro && categorias.length > 0 && (
              <span className="text-blue-600">
                {" "}
                -{" "}
                {
                  categorias.find(
                    (c) => c.id_categoria === Number(categoriaFiltro),
                  )?.nome
                }
              </span>
            )}
          </h1>
          <p className="text-slate-600">
            {categoriaFiltro
              ? "Filtrando por categoria selecionada"
              : "Encontre as melhores peças para seu veículo"}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou descrição..."
                  className="pl-10"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro Categoria */}
            <div className="w-full lg:w-64">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Fabricante */}
            <div className="w-full lg:w-64">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fabricanteFiltro}
                onChange={(e) => setFabricanteFiltro(e.target.value)}
              >
                <option value="">Todos os fabricantes</option>
                {fabricantes.map((fab) => (
                  <option key={fab.id_fabricante} value={fab.id_fabricante}>
                    {fab.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Limpar */}
            {(busca || categoriaFiltro || fabricanteFiltro) && (
              <Button variant="outline" onClick={limparFiltros}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-slate-600">
            {produtosFiltrados.length === 0 ? (
              <span>Nenhuma peça encontrada</span>
            ) : (
              <span>
                {produtosFiltrados.length}{" "}
                {produtosFiltrados.length === 1
                  ? "peça encontrada"
                  : "peças encontradas"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="container mx-auto px-4 py-8">
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Nenhuma peça encontrada
            </h3>
            <p className="text-slate-500 mb-4">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
            {(busca || categoriaFiltro || fabricanteFiltro) && (
              <Button onClick={limparFiltros} variant="outline">
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <ProdutoCard
                key={produto.id_produto}
                produto={produto}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
