import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserService } from "@/services/userService";
import { toast } from "sonner";
import { UserRole } from "@/types/user.types";

interface RoleSelectProps {
  userId: number;
  roleAtual: UserRole;
  onRoleChange: () => void;
}

export function RoleSelect({
  userId,
  roleAtual,
  onRoleChange,
}: RoleSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const roleOptions = [
    { value: UserRole.CLIENT, label: "Cliente" },
    { value: UserRole.ADMIN, label: "Administrador" },
  ];

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === roleAtual) return;

    const confirmMessage =
      newRole === UserRole.ADMIN
        ? "Tem certeza que deseja promover este usuário a Administrador?"
        : "Tem certeza que deseja remover os privilégios de Administrador deste usuário?";

    if (!confirm(confirmMessage)) return;

    setIsUpdating(true);
    try {
      await UserService.updateRole(userId, newRole);
      toast.success("Role do usuário atualizado com sucesso");
      onRoleChange();
    } catch (error) {
      console.error("Erro ao atualizar role:", error);
      toast.error("Erro ao atualizar role do usuário");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={roleAtual}
      onValueChange={handleRoleChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roleOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
