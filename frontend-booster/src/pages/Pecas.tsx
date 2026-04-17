import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { ProdutoCard } from "@/components/cards/ProdutoCard";
import { ProdutoService } from "@/services/produtoService";
import type { Produto, Categoria, Fabricante } from "@/types/produto.types";
import { Search, Filter, Loader2, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE_OPTIONS = [10, 20, 40, 80] as const;

export function Pecas() {
  const [searchParams] = useSearchParams();
  const { addProduto } = useCart();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [debouncedBusca, setDebouncedBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const [fabricanteFiltro, setFabricanteFiltro] = useState<string>("");
  const [pageSize, setPageSize] = useState(20);

  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<Array<string | undefined>>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pageNumber = cursorStack.length + 1;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : pageNumber;

  useEffect(() => {
    Promise.all([
      ProdutoService.findAllCategorias(),
      ProdutoService.findAllFabricantes(),
    ])
      .then(([cats, fabs]) => {
        setCategorias(cats);
        setFabricantes(fabs);
      })
      .catch(() => toast.error("Erro ao carregar filtros."));
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setBusca(searchQuery);
      setDebouncedBusca(searchQuery);
    }

    if (categorias.length > 0) {
      const catNome = searchParams.get("categoria");
      if (catNome) {
        const norm = (s: string) =>
          s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        const cat = categorias.find((c) => norm(c.nome) === norm(catNome));
        if (cat) setCategoriaFiltro(String(cat.id_categoria));
      }
    }
  }, [categorias, searchParams]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedBusca(busca);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [busca]);

  useEffect(() => {
    setCurrentCursor(undefined);
    setCursorStack([]);
    setNextCursor(null);
  }, [debouncedBusca, categoriaFiltro, fabricanteFiltro, pageSize]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await ProdutoService.findAllPaginated(
          pageSize,
          currentCursor,
          debouncedBusca || undefined,
          categoriaFiltro ? Number(categoriaFiltro) : undefined,
          fabricanteFiltro ? Number(fabricanteFiltro) : undefined,
        );
        if (!cancelled) {
          setProdutos(result.data);
          setHasMore(result.hasMore);
          setNextCursor(result.nextCursor);
          setTotal(result.total ?? 0);
        }
      } catch {
        if (!cancelled) toast.error("Erro ao carregar produtos. Tente novamente.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [currentCursor, pageSize, debouncedBusca, categoriaFiltro, fabricanteFiltro]);

  const goToNextPage = () => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, currentCursor]);
    setCurrentCursor(nextCursor);
  };

  const goToPrevPage = () => {
    if (cursorStack.length === 0) return;
    const prevCursor = cursorStack[cursorStack.length - 1];
    setCursorStack((prev) => prev.slice(0, -1));
    setCurrentCursor(prevCursor);
  };

  const limparFiltros = () => {
    setBusca("");
    setCategoriaFiltro("");
    setFabricanteFiltro("");
  };

  const handleAddToCart = (produto: Produto) => {
    addProduto(produto, 1);
  };

  if (isLoading && produtos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-theme-text-secondary">Carregando peças...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-theme-surface border-b border-theme-border">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-theme-text-primary mb-2">
            Catálogo de Peças
            {categoriaFiltro && categorias.length > 0 && (
              <span className="text-brand-blue">
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
          <p className="text-theme-text-secondary">
            {categoriaFiltro
              ? "Filtrando por categoria selecionada"
              : "Encontre as melhores peças para seu veículo"}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-theme-surface border-b border-theme-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-text-muted" />
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
                className="w-full px-3 py-2 bg-theme-bg border border-theme-border text-theme-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors duration-300"
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
                className="w-full px-3 py-2 bg-theme-bg border border-theme-border text-theme-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors duration-300"
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

            {/* Itens por página */}
            <div className="w-full lg:w-40">
              <select
                className="w-full px-3 py-2 bg-theme-bg border border-theme-border text-theme-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors duration-300"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} por página
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

          {/* Contador de resultados e página */}
          <div className="mt-4 flex items-center justify-between text-sm text-theme-text-secondary">
            <span>
              {isLoading ? (
                "Carregando..."
              ) : total === 0 ? (
                "Nenhuma peça encontrada"
              ) : (
                `${total} ${total === 1 ? "peça encontrada" : "peças encontradas"}`
              )}
            </span>
            <span>Página {pageNumber} de {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="container mx-auto px-4 py-8">
        {!isLoading && produtos.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-theme-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
              Nenhuma peça encontrada
            </h3>
            <p className="text-theme-text-secondary mb-4">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
            {(busca || categoriaFiltro || fabricanteFiltro) && (
              <Button onClick={limparFiltros} variant="outline">
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {produtos.map((produto) => (
                  <ProdutoCard
                    key={produto.id_produto}
                    produto={produto}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {/* Paginação */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={goToPrevPage}
                disabled={cursorStack.length === 0 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <span className="text-sm text-theme-text-secondary font-medium">
                Página {pageNumber} de {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={goToNextPage}
                disabled={!hasMore || isLoading}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
