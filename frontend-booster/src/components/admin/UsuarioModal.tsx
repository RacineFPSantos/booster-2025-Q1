import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User, UserRole } from "@/types/user.types";

interface UsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: User | null;
  onSave: (data: any) => Promise<void>;
}

export function UsuarioModal({
  open,
  onOpenChange,
  usuario,
  onSave,
}: UsuarioModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    documento: "",
    senha: "",
    role: "CLIENT" as UserRole,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        documento: usuario.documento,
        senha: "",
        role: usuario.usuario_role,
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        documento: "",
        senha: "",
        role: "CLIENT",
      });
    }
  }, [usuario, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome || formData.nome.length < 3) {
      alert("Nome deve ter no mínimo 3 caracteres");
      return;
    }

    if (!formData.email || !formData.email.includes("@")) {
      alert("Email inválido");
      return;
    }

    if (!formData.documento || formData.documento.length < 11) {
      alert("Documento deve ter no mínimo 11 caracteres (CPF)");
      return;
    }

    if (!usuario && (!formData.senha || formData.senha.length < 6)) {
      alert("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const data: any = {
        nome: formData.nome,
        email: formData.email,
        documento: formData.documento,
        role: formData.role,
      };

      // Apenas incluir senha ao criar ou se foi preenchida ao editar
      if (!usuario || formData.senha) {
        data.senha = formData.senha;
      }

      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {usuario ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Nome completo"
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@exemplo.com"
              required
              disabled={!!usuario}
            />
            {usuario && (
              <p className="text-xs text-slate-500">
                Email não pode ser alterado
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento">Documento (CPF/CNPJ) *</Label>
            <Input
              id="documento"
              value={formData.documento}
              onChange={(e) =>
                setFormData({ ...formData, documento: e.target.value })
              }
              placeholder="00000000000"
              required
              minLength={11}
              maxLength={14}
              disabled={!!usuario}
            />
            {usuario && (
              <p className="text-xs text-slate-500">
                Documento não pode ser alterado
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">
              Senha {!usuario && "*"}
              {usuario && " (deixe em branco para manter)"}
            </Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) =>
                setFormData({ ...formData, senha: e.target.value })
              }
              placeholder="••••••••"
              required={!usuario}
              minLength={6}
            />
            <p className="text-xs text-slate-500">Mínimo 6 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Usuário *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="CLIENT">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
