
import React from 'react';
import { UserRole } from "@/types/user";
import { Shield, Users, Tool } from "lucide-react";

export const roleIcons: Record<UserRole, React.ReactNode> = {
  Administrador: <Shield size={16} color="#22c55e" />,
  Técnico: <Tool size={16} color="#3b82f6" />,
  Usuário: <Users size={16} color="#6b7280" />
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
