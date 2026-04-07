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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TipoClienteEnum } from "@/types/auth.types";
import {
  validateDocument,
  formatDocument,
  removeNonNumeric,
} from "@/lib/validators";
import { toast } from "sonner";
import { Car, User, Mail, Lock, FileText } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";

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
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "documento") {
      const formatted = formatDocument(value, tipoDocumento);
      setFormData({ ...formData, [name]: formatted });
    } else if (name === "tipo_cliente") {
      setTipoDocumento(value as TipoClienteEnum);
      setFormData({ ...formData, documento: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const documentoLimpo = removeNonNumeric(formData.documento);

    if (!validateDocument(documentoLimpo, tipoDocumento)) {
      const tipoDoc = tipoDocumento === TipoClienteEnum.PF ? "CPF" : "CNPJ";
      toast.error(`${tipoDoc} inválido. Por favor, verifique o número digitado.`);
      return;
    }

    setIsLoading(true);

    try {
      await register({ ...formData, documento: documentoLimpo });
      toast.success("Conta criada com sucesso! Bem-vindo!");
      navigate("/");
    } catch (err: unknown) {
      let errorMessage = "Erro ao criar conta";
      if (err instanceof Error) {
        errorMessage = err?.message || errorMessage;
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
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div
          className="flex items-center justify-center gap-1 mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Car className="h-8 w-8 text-brand-blue" />
          <span className="text-2xl font-extrabold text-brand-blue tracking-tighter">AI</span>
          <span className="text-2xl font-bold text-theme-text-primary tracking-tight">Car</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>Preencha os dados para se cadastrar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text-muted" />
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text-muted" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text-muted" />
                  <Input
                    id="senha"
                    name="senha"
                    type="password"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="pl-10"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo_cliente">Tipo de pessoa</Label>
                <select
                  id="tipo_cliente"
                  name="tipo_cliente"
                  value={tipoDocumento}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1 h-9 dark:bg-input/30 bg-transparent border border-input rounded-md text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow]"
                >
                  <option value={TipoClienteEnum.PF}>Pessoa Física (CPF)</option>
                  <option value={TipoClienteEnum.PJ}>Pessoa Jurídica (CNPJ)</option>
                </select>
              </div>

              {/* Documento */}
              <div className="space-y-2">
                <Label htmlFor="documento">
                  {tipoDocumento === TipoClienteEnum.PF ? "CPF" : "CNPJ"}
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text-muted" />
                  <Input
                    id="documento"
                    name="documento"
                    type="text"
                    value={formData.documento}
                    onChange={handleChange}
                    required
                    maxLength={tipoDocumento === TipoClienteEnum.PF ? 14 : 18}
                    className="pl-10"
                    placeholder={
                      tipoDocumento === TipoClienteEnum.PF
                        ? "000.000.000-00"
                        : "00.000.000/0000-00"
                    }
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-theme-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-theme-text-muted">
                    Já tem uma conta?
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsLoginOpen(true)}
              >
                Fazer login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </div>
  );
}
