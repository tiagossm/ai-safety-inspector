
export type Checklist = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  status_checklist: "ativo" | "inativo";
  is_template: boolean;
  user_id: string;
  // Adding these properties used in the UI
  collaborators?: CollaboratorType[];
  items?: number;
  permissions?: string[];
  isTemplate?: boolean; // This is derived from is_template
};

export type ChecklistItem = {
  id: string;
  checklist_id: string;
  pergunta: string;
  tipo_resposta: "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla";
  obrigatorio: boolean;
  ordem: number;
  opcoes: string[] | null;
};

export type CollaboratorType = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
};

export type NewChecklist = {
  title: string;
  description: string | null;
  is_template: boolean;
};

export type ChecklistFilter = "all" | "templates" | "custom";
