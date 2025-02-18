
import { ReactNode } from "react";
import { UserRole } from "@/types/user";
import { Shield, Users, User } from "lucide-react";

export const roleIcons: Record<UserRole, ReactNode> = {
  [UserRole.ADMIN]: <Shield className="h-4 w-4 text-blue-500" />,
  [UserRole.TECHNICIAN]: <Users className="h-4 w-4 text-green-500" />,
  [UserRole.USER]: <User className="h-4 w-4 text-gray-500" />
};

export const roleInfo: Record<UserRole, { iconColor: string; description: string; permissions: string[] }> = {
  [UserRole.ADMIN]: {
    iconColor: "text-blue-500",
    description: "Acesso total ao sistema",
    permissions: ["Gerenciar usuários", "Gerenciar empresas", "Configurar sistema"]
  },
  [UserRole.TECHNICIAN]: {
    iconColor: "text-green-500",
    description: "Acesso às funcionalidades técnicas",
    permissions: ["Realizar inspeções", "Gerar relatórios", "Visualizar empresas"]
  },
  [UserRole.USER]: {
    iconColor: "text-gray-500",
    description: "Acesso básico ao sistema",
    permissions: ["Visualizar relatórios", "Atualizar perfil"]
  }
};
