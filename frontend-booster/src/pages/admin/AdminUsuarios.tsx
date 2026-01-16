import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserService } from "@/services/userService";
import { UsuarioModal } from "@/components/admin/UsuarioModal";
import { RoleSelect } from "@/components/admin/RoleSelect";
import type { User, UserStats } from "@/types/user.types";
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Loader2,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  TrendingUp,
  Power,
  PowerOff,
} from "lucide-react";
import { toast } from "sonner";

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [roleFiltro, setRoleFiltro] = useState<string>("");
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [busca, roleFiltro, statusFiltro, usuarios]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usuariosData, statsData] = await Promise.all([
        UserService.findAll(),
        UserService.getStats(),
      ]);

      setUsuarios(usuariosData);
      setUsuariosFiltrados(usuariosData);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...usuarios];

    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (u) =>
          u.nome.toLowerCase().includes(buscaLower) ||
          u.email.toLowerCase().includes(buscaLower) ||
          u.documento.includes(busca),
      );
    }

    // Filtro por role
    if (roleFiltro) {
      resultado = resultado.filter((u) => u.usuario_role === roleFiltro);
    }

    // Filtro por status
    if (statusFiltro === "ativo") {
      resultado = resultado.filter((u) => u.is_active);
    } else if (statusFiltro === "inativo") {
      resultado = resultado.filter((u) => !u.is_active);
    }

    setUsuariosFiltrados(resultado);
  };

  const handleNovoUsuario = () => {
    setUsuarioEditando(null);
    setIsModalOpen(true);
  };

  const handleEditarUsuario = (usuario: User) => {
    setUsuarioEditando(usuario);
    setIsModalOpen(true);
  };

  const handleSaveUsuario = async (data: any) => {
    try {
      if (usuarioEditando) {
        await UserService.update(usuarioEditando.id_usuario, data);
        toast.success("Usuário atualizado com sucesso");
      } else {
        await UserService.create(data);
        toast.success("Usuário criado com sucesso");
      }
      loadData();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Erro ao salvar usuário";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleToggleStatus = async (usuario: User) => {
    const action = usuario.is_active ? "desativar" : "ativar";
    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) return;

    try {
      await UserService.updateStatus(usuario.id_usuario, !usuario.is_active);
      toast.success(
        `Usuário ${usuario.is_active ? "desativado" : "ativado"} com sucesso`,
      );
      loadData();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do usuário");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCPFCNPJ = (documento: string) => {
    if (documento.length === 11) {
      // CPF: 000.000.000-00
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (documento.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return documento.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }
    return documento;
  };

  const limparFiltros = () => {
    setBusca("");
    setRoleFiltro("");
    setStatusFiltro("");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Carregando usuários...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gestão de Usuários
          </h1>
          <p className="text-slate-600 mt-1">Gerencie os usuários do sistema</p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <UserCheck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.clientes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Administradores
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.admins}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                <Power className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ativos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inativos</CardTitle>
                <PowerOff className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inativos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Novos este Mês
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.novosEsteMes}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros e Ações */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome, email ou documento..."
                    className="pl-10"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full lg:w-48">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={roleFiltro}
                  onChange={(e) => setRoleFiltro(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="CLIENT">Clientes</option>
                  <option value="ADMIN">Administradores</option>
                </select>
              </div>

              <div className="w-full lg:w-48">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </div>

              {(busca || roleFiltro || statusFiltro) && (
                <Button variant="outline" onClick={limparFiltros}>
                  Limpar
                </Button>
              )}

              <Button onClick={handleNovoUsuario}>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

            <div className="mt-4 text-sm text-slate-600">
              {usuariosFiltrados.length === 0 ? (
                <span>Nenhum usuário encontrado</span>
              ) : (
                <span>
                  {usuariosFiltrados.length}{" "}
                  {usuariosFiltrados.length === 1
                    ? "usuário encontrado"
                    : "usuários encontrados"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <UserX className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-slate-500 mb-4">
                  {busca || roleFiltro || statusFiltro
                    ? "Tente ajustar os filtros"
                    : "Comece criando um novo usuário"}
                </p>
                {(busca || roleFiltro || statusFiltro) && (
                  <Button onClick={limparFiltros} variant="outline">
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-slate-700">
                        ID
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Nome
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Email
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Documento
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Tipo
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">
                        Cadastro
                      </th>
                      <th className="text-right p-4 font-semibold text-slate-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr
                        key={usuario.id_usuario}
                        className="border-b hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 text-slate-600">
                          #{usuario.id_usuario}
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-900">
                            {usuario.nome}
                          </p>
                        </td>
                        <td className="p-4 text-slate-600">{usuario.email}</td>
                        <td className="p-4 text-slate-600">
                          {formatCPFCNPJ(usuario.documento)}
                        </td>
                        <td className="p-4">
                          <RoleSelect
                            userId={usuario.id_usuario}
                            roleAtual={usuario.usuario_role}
                            onRoleChange={loadData}
                          />
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              usuario.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {usuario.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {formatDate(usuario.created_at)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleEditarUsuario(usuario)}
                              title="Editar usuário"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={
                                usuario.is_active
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              }
                              onClick={() => handleToggleStatus(usuario)}
                              title={
                                usuario.is_active
                                  ? "Desativar usuário"
                                  : "Ativar usuário"
                              }
                            >
                              {usuario.is_active ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Criação/Edição */}
      <UsuarioModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        usuario={usuarioEditando}
        onSave={handleSaveUsuario}
      />
    </AdminLayout>
  );
}
