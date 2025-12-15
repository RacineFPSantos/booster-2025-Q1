import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TipoClienteEnum } from "@/types/auth.types";
import {
  validateDocument,
  formatDocument,
  removeNonNumeric,
} from "@/lib/validators";
import { toast } from "sonner";

export function Register() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    documento: "",
  });
  const [tipoDocumento, setTipoDocumento] = useState<TipoClienteEnum>(
    TipoClienteEnum.PF,
  );
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "documento") {
      const formatted = formatDocument(value, tipoDocumento);
      setFormData({
        ...formData,
        [name]: formatted,
      });
    } else if (name === "tipo_cliente") {
      setTipoDocumento(value as TipoClienteEnum);
      setFormData({
        ...formData,
        documento: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const documentoLimpo = removeNonNumeric(formData.documento);

    if (!validateDocument(documentoLimpo, tipoDocumento)) {
      const tipoDoc = tipoDocumento === TipoClienteEnum.PF ? "CPF" : "CNPJ";
      toast.error(
        `${tipoDoc} inválido. Por favor, verifique o número digitado.`,
      );
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = {
        ...formData,
        documento: documentoLimpo,
      };

      await register(dataToSend);
      toast.success("Conta criada com sucesso! Bem-vindo!");
      navigate("/");
    } catch (err: unknown) {
      let errorMessage = "";

      if (err instanceof Error) {
        errorMessage = err?.message || "Erro ao criar conta";
        console.error(err.message);
      } else if (typeof err === "string") {
        console.error(`Erro como string: ${err}`);
      } else {
        console.error("Um erro desconhecido ocorreu.");
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>Preencha os dados para se cadastrar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <input
                id="senha"
                name="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_cliente">Tipo</Label>
              <select
                id="tipo_cliente"
                name="tipo_cliente"
                value={tipoDocumento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={TipoClienteEnum.PF}>Pessoa Física (CPF)</option>
                <option value={TipoClienteEnum.PJ}>
                  Pessoa Jurídica (CNPJ)
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">
                {tipoDocumento === TipoClienteEnum.PF ? "CPF" : "CNPJ"}
              </Label>
              <input
                id="documento"
                name="documento"
                type="text"
                value={formData.documento}
                onChange={handleChange}
                required
                maxLength={tipoDocumento === TipoClienteEnum.PF ? 14 : 18}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  tipoDocumento === TipoClienteEnum.PF
                    ? "000.000.000-00"
                    : "00.000.000/0000-00"
                }
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Já tem uma conta? </span>
              <a href="/login" className="text-blue-600 hover:underline">
                Faça login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
