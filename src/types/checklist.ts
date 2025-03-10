export interface CollaboratorType {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  is_template: boolean;
  status_checklist: "ativo" | "inativo";
  category: string;
  responsible_id?: string | null;
  responsible_name?: string;
  company_id?: string | null;
  company_name?: string;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  due_date?: string | null;
  items?: number;
  items_completed?: number;
  collaborators?: CollaboratorType[];
  permissions?: string[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  pergunta: string;
  tipo_resposta: "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla";
  obrigatorio: boolean;
  opcoes: string[] | null;
  ordem: number;
  resposta?: string | number | boolean | null;
  permite_audio: boolean;
  permite_video: boolean;
  permite_foto: boolean;
}

export interface NewChecklist {
  title: string;
  description?: string;
  is_template?: boolean;
  status_checklist?: string;
  category?: string;
  responsible_id?: string | null;
  company_id?: string | null;
  due_date?: string | null;
  user_id?: string | null;
}
