
export interface ChecklistWithStats {
  id: string;
  title: string;
  description?: string;
  isTemplate: boolean;
  status: string;
  category?: string;
  responsibleId?: string;
  companyId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  isSubChecklist?: boolean;
  origin?: string;
  totalQuestions: number;
  completedQuestions?: number;
  companyName?: string;
  responsibleName?: string;
}

export interface NewChecklistPayload {
  title: string;
  description?: string;
  is_template?: boolean;
  status_checklist?: string;
  status?: string;
  category?: string;
  company_id?: string;
  responsible_id?: string;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  status: string;
  status_checklist?: string;
  is_template: boolean;
  user_id?: string;
  company_id?: string;
  responsible_id?: string;
  category?: string;
  questions?: ChecklistItem[];
  groups?: ChecklistGroup[];
  responsibleName?: string;
}

export interface ChecklistItem {
  id: string;
  ordem: number;
  pergunta: string;
  tipo_resposta: string;
  opcoes?: string[] | null;
  obrigatorio: boolean;
  permite_foto?: boolean;
  permite_video?: boolean;
  permite_audio?: boolean;
  weight?: number;
  hint?: string;
  groupId?: string | null;
  parent_item_id?: string | null;
  condition_value?: string | null;
  sub_checklist_id?: string | null;
  hasSubChecklist?: boolean;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  order: number;
}

export interface ChecklistSortOption {
  label: string;
  value: string;
}

export interface NewChecklist {
  title?: string;
  description?: string;
  is_template?: boolean;
  status_checklist?: string;
  category?: string;
  company_id?: string | null;
  responsible_id?: string | null;
  status?: string;
}

export interface BatchUpdateResult {
  success: boolean;
  count: number;
}
