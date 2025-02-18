
import { Crown, Users2, Wrench } from "lucide-react";
import { UserRole } from "@/types/user";

export const roleInfo: Record<UserRole, {
  icon: JSX.Element;
  description: string;
  permissions: string[];
}> = {
  Administrador: {
    icon: <Crown className="h-5 w-5 text-green-500" />,
    description: "Acesso total ao sistema, gerencia usuários e suas permissões",
    permissions: [
      "Acessa tudo no sistema",
      "Gerencia usuários e permissões",
      "Gerencia empresas e checklists",
      "Visualiza todos os relatórios"
    ]
  },
  Gerente: {
    icon: <Users2 className="h-5 w-5 text-yellow-500" />,
    description: "Gerencia empresas e checklists, atribui tarefas aos técnicos",
    permissions: [
      "Gerencia empresas e checklists",
      "Atribui checklists para usuários",
      "Visualiza relatórios da empresa",
      "Não pode alterar usuários/permissões"
    ]
  },
  Técnico: {
    icon: <Wrench className="h-5 w-5 text-blue-500" />,
    description: "Preenche checklists e faz upload de evidências",
    permissions: [
      "Preenche checklists atribuídos",
      "Faz upload de arquivos/evidências",
      "Gera relatórios dos seus checklists",
      "Visualiza checklists da empresa"
    ]
  }
};
