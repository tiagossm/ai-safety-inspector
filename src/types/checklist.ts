
export type Checklist = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  status_checklist: "ativo" | "inativo";
  is_template: boolean;
  user_id?: string;  // Mark as optional since it might not exist in the database
  company_id?: string;  // Adding this as it appears in error messages
  status?: string;      // Adding this as it appears in error messages
  category?: string;    // Adding category field
  // Adding these properties used in the UI
  collaborators?: CollaboratorType[];
  items?: number;
  permissions?: string[];
  responsible_id?: string; // ID of the responsible user
  responsible_name?: string; // Name of the responsible user
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
  is_template?: boolean;
  category?: string;
  responsible_id?: string;
};

export type ChecklistFilter = "all" | "templates" | "custom";
