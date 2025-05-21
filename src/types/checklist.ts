
export interface CollaboratorType {
  id: string;
  name: string;
  avatar: string;
  email: string;
  initials?: string; // Adding the initials property as optional
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
  status?: "pendente" | "em_andamento" | "concluido";
  comments?: ChecklistComment[];
  attachments?: ChecklistAttachment[];
  history?: ChecklistHistory[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  pergunta: string;
  tipo_resposta: "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla" | string;
  obrigatorio: boolean;
  opcoes?: string[] | null;
  ordem: number;
  resposta?: string | number | boolean | null;
  permite_audio?: boolean;
  permite_video?: boolean;
  permite_foto?: boolean;
  permite_files?: boolean;
  created_at?: string;
  updated_at?: string;
  hint?: string;
  weight?: number;
  parent_item_id?: string | null;
  condition_value?: string | null;
  has_subchecklist?: boolean;
  sub_checklist_id?: string;
}

export interface NewChecklist {
  title: string;
  description?: string;
  is_template?: boolean;
  status_checklist?: "ativo" | "inativo";
  status?: string;
  category?: string;
  responsible_id?: string | null;
  company_id?: string | null;
  due_date?: string | null;
  user_id?: string | null;
  origin?: 'manual' | 'ia' | 'csv';
}

export interface ChecklistComment {
  id: string;
  checklist_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface ChecklistAttachment {
  id: string;
  checklist_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface ChecklistHistory {
  id: string;
  checklist_id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
}
