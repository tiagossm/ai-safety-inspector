
import { Crown, Users2, Wrench } from "lucide-react";
import { UserRole } from "@/types/user";

const createIcon = (Icon: typeof Crown | typeof Users2 | typeof Wrench, color: string) => {
  return () => <Icon className={`h-5 w-5 text-${color}-500`} />;
};

export const roleInfo: Record<UserRole, {
  icon: () => JSX.Element;
  description: string;
  permissions: string[];
}> = {
  Administrador: {
    icon: createIcon(Crown, "green"),
    description: "Acesso total ao sistema, gerencia usuários e suas permissões",
    permissions: [
      "Acessa tudo no sistema",
      "Gerencia usuários e permissões",
      "Gerencia empresas e checklists",
      "Visualiza todos os relatórios"
    ]
  },
  Gerente: {
    icon: createIcon(Users2, "yellow"),
    description: "Gerencia empresas e checklists, atribui tarefas aos técnicos",
    permissions: [
      "Gerencia empresas e checklists",
      "Atribui checklists para usuários",
      "Visualiza relatórios da empresa",
      "Não pode alterar usuários/permissões"
    ]
  },
  Técnico: {
    icon: createIcon(Wrench, "blue"),
    description: "Preenche checklists e faz upload de evidências",
    permissions: [
      "Preenche checklists atribuídos",
      "Faz upload de arquivos/evidências",
      "Gera relatórios dos seus checklists",
      "Visualiza checklists da empresa"
    ]
  }
};
