import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ServicoCard } from "@/components/cards/ServicoCard";
import {
  AgendamentoModal,
  AgendamentoData,
} from "@/components/services/AgendamentoModal";
import type { Servico, TipoServico } from "@/types/servico.types";
import { Search, Filter, Loader2, Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServicoService } from "@/services/servicoService";
import { useAuth } from "@/contexts/AuthContext";

const PAGE_SIZE_OPTIONS = [10, 20, 40, 80] as const;

export function Servicos() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [debouncedBusca, setDebouncedBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("");
  const [pageSize, setPageSize] = useState(20);

  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<Array<string | undefined>>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [pendingServico, setPendingServico] = useState<Servico | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const pageNumber = cursorStack.length + 1;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : pageNumber;

  useEffect(() => {
    ServicoService.findAllTipos()
      .then(setTiposServico)
      .catch(() => toast.error("Erro ao carregar tipos de serviço."));
  }, []);

  useEffect(() => {
    if (tiposServico.length > 0) {
      const tipoNome = searchParams.get("tipo");
      if (tipoNome) {
        const norm = (s: string) =>
          s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        const tipo = tiposServico.find((t) => norm(t.nome) === norm(tipoNome));
        if (tipo) setTipoFiltro(String(tipo.id_tipo_servico));
      }
    }
  }, [tiposServico, searchParams]);

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
  }, [debouncedBusca, tipoFiltro, pageSize]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await ServicoService.findAllPaginated(
          pageSize,
          currentCursor,
          debouncedBusca || undefined,
          tipoFiltro ? Number(tipoFiltro) : undefined,
        );
        if (!cancelled) {
          setServicos(result.data);
          setHasMore(result.hasMore);
          setNextCursor(result.nextCursor);
          setTotal(result.total);
        }
      } catch {
        if (!cancelled) toast.error("Erro ao carregar serviços. Tente novamente.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [currentCursor, pageSize, debouncedBusca, tipoFiltro]);

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
    setTipoFiltro("");
  };

  useEffect(() => {
    if (isAuthenticated && pendingServico) {
      setServicoSelecionado(pendingServico);
      setIsModalOpen(true);
      setPendingServico(null);
    }
  }, [isAuthenticated, pendingServico]);

  const handleAgendar = (servico: Servico) => {
    if (!isAuthenticated) {
      setPendingServico(servico);
      window.dispatchEvent(new CustomEvent("auth:expired"));
      return;
    }
    setServicoSelecionado(servico);
    setIsModalOpen(true);
  };

  const handleConfirmarAgendamento = async (data: AgendamentoData) => {
    try {
      await ServicoService.createAgendamento(data);
      toast.success(
        `Agendamento de "${servicoSelecionado?.nome}" realizado com sucesso!`,
      );
      toast.info("Você receberá uma confirmação por telefone em breve.");
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error("Erro ao realizar agendamento. Tente novamente.");
      throw error;
    }
  };

  if (isLoading && servicos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-theme-text-secondary">Carregando serviços...</p>
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
            Nossos Serviços
            {tipoFiltro && tiposServico.length > 0 && (
              <span className="text-brand-blue">
                {" "}
                -{" "}
                {
                  tiposServico.find(
                    (t) => t.id_tipo_servico === Number(tipoFiltro),
                  )?.nome
                }
              </span>
            )}
          </h1>
          <p className="text-theme-text-secondary">
            {tipoFiltro
              ? "Filtrando por tipo de serviço selecionado"
              : "Agende os melhores serviços para seu veículo"}
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
                  placeholder="Buscar por serviço..."
                  className="pl-10"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro Tipo */}
            <div className="w-full lg:w-64">
              <select
                className="w-full px-3 py-2 bg-theme-bg border border-theme-border text-theme-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors duration-300"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                {tiposServico.map((tipo) => (
                  <option key={tipo.id_tipo_servico} value={tipo.id_tipo_servico}>
                    {tipo.nome}
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
            {(busca || tipoFiltro) && (
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
                "Nenhum serviço encontrado"
              ) : (
                `${total} ${total === 1 ? "serviço disponível" : "serviços disponíveis"}`
              )}
            </span>
            <span>Página {pageNumber} de {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Grid de Serviços */}
      <div className="container mx-auto px-4 py-8">
        {!isLoading && servicos.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 text-theme-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-theme-text-secondary mb-4">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
            {(busca || tipoFiltro) && (
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
                {servicos.map((servico) => (
                  <ServicoCard
                    key={servico.id_servico}
                    servico={servico}
                    onAgendar={handleAgendar}
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

      {/* Modal de Agendamento */}
      <AgendamentoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        servico={servicoSelecionado}
        onConfirm={handleConfirmarAgendamento}
      />
    </>
  );
}
