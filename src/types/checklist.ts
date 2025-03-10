
export type Checklist = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  status_checklist: "ativo" | "inativo";
  is_template: boolean;
  user_id?: string;
  company_id?: string;
  status?: string;
  category?: string;
  responsible_id?: string;
  responsible_name?: string;
  due_date?: string | null;
  // UI properties
  collaborators?: CollaboratorType[];
  items?: number;
  permissions?: string[];
  // Adding properties needed in ChecklistCard and ChecklistDetailsContainer
  items_total?: number;
  items_completed?: number;
  // New property to track access level
  access_level?: "owner" | "admin" | "editor" | "viewer";
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
  company_id?: string;
  user_id?: string;
  due_date?: string | null;
};

export type ChecklistFilter = "all" | "templates" | "custom";

// Tipos para criação de checklists inteligente
export type AIChecklistPrompt = {
  prompt: string;
  num_questions: number;
  category?: string;
};

// Tipo para resposta da IA
export type AIResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

// Tipo para upload de mídia em checklists
export type ChecklistMedia = {
  id: string;
  checklist_item_id: string;
  file_url: string;
  file_type: "image" | "audio" | "video";
  created_at: string;
};

// New types for user access control
export type ChecklistPermission = {
  id: string;
  checklist_id: string;
  user_id: string;
  access_level: "owner" | "admin" | "editor" | "viewer";
  granted_by: string;
  granted_at: string;
};

export type ChecklistAssignment = {
  id: string;
  checklist_id: string;
  company_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: "active" | "inactive";
};
