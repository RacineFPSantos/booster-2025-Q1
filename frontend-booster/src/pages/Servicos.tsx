import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ServicoCard } from "@/components/cards/ServicoCard";
import type { Servico, TipoServico } from "@/types/servico.types";
import { Search, Filter, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

export function Servicos() {
  const [searchParams] = useSearchParams();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicosFiltrados, setServicosFiltrados] = useState<Servico[]>([]);
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("");

  // Dados mockados de tipos de serviço
  const tiposServicoMock: TipoServico[] = [
    { id_tipo_servico: 1, nome: "Manutenção Preventiva" },
    { id_tipo_servico: 2, nome: "Manutenção Corretiva" },
    { id_tipo_servico: 3, nome: "Diagnóstico" },
    { id_tipo_servico: 4, nome: "Estética Automotiva" },
    { id_tipo_servico: 5, nome: "Instalação" },
  ];

  // Dados mockados de serviços
  const servicosMock: Servico[] = [
    {
      id_servico: 1,
      nome: "Troca de Óleo",
      descricao: "Troca de óleo do motor com filtro, verificação de níveis e inspeção visual completa",
      preco: 150.00,
      duracao_estimada: 45,
      id_tipo_servico: 1,
      tipo_servico: tiposServicoMock[0],
    },
    {
      id_servico: 2,
      nome: "Alinhamento e Balanceamento",
      descricao: "Alinhamento computadorizado das rodas e balanceamento completo dos pneus",
      preco: 120.00,
      duracao_estimada: 60,
      id_tipo_servico: 1,
      tipo_servico: tiposServicoMock[0],
    },
    {
      id_servico: 3,
      nome: "Revisão de Freios",
      descricao: "Inspeção completa do sistema de freios, pastilhas, discos e fluido",
      preco: 200.00,
      duracao_estimada: 90,
      id_tipo_servico: 1,
      tipo_servico: tiposServicoMock[0],
    },
    {
      id_servico: 4,
      nome: "Troca de Pastilhas de Freio",
      descricao: "Substituição das pastilhas de freio dianteiras ou traseiras",
      preco: 280.00,
      duracao_estimada: 120,
      id_tipo_servico: 2,
      tipo_servico: tiposServicoMock[1],
    },
    {
      id_servico: 5,
      nome: "Troca de Correia Dentada",
      descricao: "Substituição da correia dentada do motor com verificação de tensionadores",
      preco: 450.00,
      duracao_estimada: 180,
      id_tipo_servico: 2,
      tipo_servico: tiposServicoMock[1],
    },
    {
      id_servico: 6,
      nome: "Diagnóstico Computadorizado",
      descricao: "Análise completa do sistema eletrônico do veículo com scanner automotivo",
      preco: 80.00,
      duracao_estimada: 30,
      id_tipo_servico: 3,
      tipo_servico: tiposServicoMock[2],
    },
    {
      id_servico: 7,
      nome: "Troca de Bateria",
      descricao: "Substituição da bateria com teste do sistema elétrico",
      preco: 350.00,
      duracao_estimada: 30,
      id_tipo_servico: 2,
      tipo_servico: tiposServicoMock[1],
    },
    {
      id_servico: 8,
      nome: "Limpeza de Injetores",
      descricao: "Limpeza profunda dos bicos injetores de combustível",
      preco: 180.00,
      duracao_estimada: 90,
      id_tipo_servico: 1,
      tipo_servico: tiposServicoMock[0],
    },
    {
      id_servico: 9,
      nome: "Polimento e Cristalização",
      descricao: "Polimento completo da pintura com aplicação de cristalizador",
      preco: 400.00,
      duracao_estimada: 240,
      id_tipo_servico: 4,
      tipo_servico: tiposServicoMock[3],
    },
    {
      id_servico: 10,
      nome: "Instalação de Som Automotivo",
      descricao: "Instalação completa de sistema de som com chicotes e conectores",
      preco: 150.00,
      duracao_estimada: 120,
      id_tipo_servico: 5,
      tipo_servico: tiposServicoMock[4],
    },
    {
      id_servico: 11,
      nome: "Higienização de Ar-Condicionado",
      descricao: "Limpeza completa do sistema de ar-condicionado com produtos especializados",
      preco: 120.00,
      duracao_estimada: 60,
      id_tipo_servico: 1,
      tipo_servico: tiposServicoMock[0],
    },
    {
      id_servico: 12,
      nome: "Troca de Amortecedores",
      descricao: "Substituição dos amortecedores dianteiros ou traseiros",
      preco: 600.00,
      duracao_estimada: 180,
      id_tipo_servico: 2,
      tipo_servico: tiposServicoMock[1],
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [busca, tipoFiltro, servicos]);

  // Aplicar filtro de tipo da URL quando os dados são carregados
  useEffect(() => {
    if (tiposServico.length > 0) {
      const tipoNome = searchParams.get("tipo");
      if (tipoNome) {
        const normalizarString = (str: string) => {
          return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
        };

        const tipoNormalizado = normalizarString(tipoNome);

        const tipoEncontrado = tiposServico.find(
          (tipo) => normalizarString(tipo.nome) === tipoNormalizado,
        );

        if (tipoEncontrado) {
          setTipoFiltro(String(tipoEncontrado.id_tipo_servico));
        }
      }
    }
  }, [tiposServico, searchParams]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Simulando delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      setServicos(servicosMock);
      setServicosFiltrados(servicosMock);
      setTiposServico(tiposServicoMock);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast.error("Erro ao carregar serviços. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...servicos];

    // Filtro de busca por nome ou descrição
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (s) =>
          s.nome.toLowerCase().includes(buscaLower) ||
          s.descricao?.toLowerCase().includes(buscaLower),
      );
    }

    // Filtro por tipo de serviço
    if (tipoFiltro) {
      resultado = resultado.filter(
        (s) => s.id_tipo_servico === Number(tipoFiltro),
      );
    }

    setServicosFiltrados(resultado);
  };

  const limparFiltros = () => {
    setBusca("");
    setTipoFiltro("");
  };

  const handleAgendar = (servico: Servico) => {
    toast.success(`Agendamento de "${servico.nome}" em desenvolvimento!`);
    // TODO: Implementar lógica de agendamento
  };

  if (isLoading) {
    return (
      <>
        <Toaster />
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-slate-600">Carregando serviços...</p>
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
            Nossos Serviços
            {tipoFiltro && tiposServico.length > 0 && (
              <span className="text-green-600">
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
          <p className="text-slate-600">
            {tipoFiltro
              ? "Filtrando por tipo de serviço selecionado"
              : "Agende os melhores serviços para seu veículo"}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

            {/* Botão Limpar */}
            {(busca || tipoFiltro) && (
              <Button variant="outline" onClick={limparFiltros}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-slate-600">
            {servicosFiltrados.length === 0 ? (
              <span>Nenhum serviço encontrado</span>
            ) : (
              <span>
                {servicosFiltrados.length}{" "}
                {servicosFiltrados.length === 1
                  ? "serviço disponível"
                  : "serviços disponíveis"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Serviços */}
      <div className="container mx-auto px-4 py-8">
        {servicosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-slate-500 mb-4">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
            {(busca || tipoFiltro) && (
              <Button onClick={limparFiltros} variant="outline">
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servicosFiltrados.map((servico) => (
              <ServicoCard
                key={servico.id_servico}
                servico={servico}
                onAgendar={handleAgendar}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
