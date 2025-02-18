
import { UserRole } from "@/types/user";
import { Shield, Users, Tool } from "lucide-react";

export const roleIcons: Record<UserRole, JSX.Element> = {
  Administrador: <Shield className="h-4 w-4 text-green-500" />,
  Técnico: <Tool className="h-4 w-4 text-blue-500" />,
  Usuário: <Users className="h-4 w-4 text-gray-500" />
};

export const roleInfo: Record<UserRole, {
  iconColor: string;
  description: string;
  permissions: string[];
}> = {
  Administrador: {
    iconColor: "green",
    description: "Acesso total ao sistema, gerencia usuários e suas permissões",
    permissions: [
      "Acessa tudo no sistema",
      "Gerencia usuários e permissões",
      "Gerencia empresas e checklists",
      "Visualiza todos os relatórios"
    ]
  },
  Técnico: {
    iconColor: "blue",
    description: "Preenche checklists e faz upload de evidências",
    permissions: [
      "Preenche checklists atribuídos",
      "Faz upload de arquivos/evidências",
      "Gera relatórios dos seus checklists",
      "Visualiza checklists da empresa"
    ]
  },
  Usuário: {
    iconColor: "gray",
    description: "Acesso básico ao sistema",
    permissions: [
      "Visualiza seus dados",
      "Acessa checklists atribuídos",
      "Visualiza relatórios básicos",
      "Não pode alterar configurações"
    ]
  }
};
