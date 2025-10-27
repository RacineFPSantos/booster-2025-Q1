import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login({ email, senha });
      onOpenChange(false);
      setEmail("");
      setSenha("");

      toast.success("Login realizado com sucesso!");
    } catch (err: unknown) {
      let errorMessage = "";

      if (err instanceof Error) {
        errorMessage =
          err?.message || "Erro ao fazer login. Verifique suas credenciais.";
        console.error(err.message);
      } else if (typeof err === "string") {
        console.error(`Erro como string: ${err}`);
      } else {
        console.error("Um erro desconhecido ocorreu.");
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    onOpenChange(false);
    navigate("/register");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <LogIn className="h-6 w-6 text-blue-600" />
            Entrar na sua conta
          </DialogTitle>
          <DialogDescription>
            Acesse sua conta para continuar comprando e agendar serviços
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                navigate("/recuperar-senha");
              }}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Não tem uma conta?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleRegisterClick}
          >
            Criar nova conta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
