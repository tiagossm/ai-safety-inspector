
import { UserRole } from "@/types/user";

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
  Gerente: {
    iconColor: "yellow",
    description: "Gerencia empresas e checklists, atribui tarefas aos técnicos",
    permissions: [
      "Gerencia empresas e checklists",
      "Atribui checklists para usuários",
      "Visualiza relatórios da empresa",
      "Não pode alterar usuários/permissões"
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
  }
};
