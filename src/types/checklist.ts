export interface CollaboratorType {
  id: string;
  name: string;
  avatar: string;
  email: string;
  initials?: string; // Adding the initials property as optional
}

export type ResponseType = 
  | "sim/não" 
  | "texto" 
  | "numérico" 
  | "seleção múltipla" 
  | "foto" 
  | "assinatura" 
  | "data" 
  | "hora";

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
  questions?: ChecklistItem[];
  groups?: ChecklistGroup[];
  responsibleName?: string;
  origin?: 'manual' | 'ia' | 'csv';
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  pergunta: string;
  tipo_resposta: ResponseType | string;
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
  text?: string;
  responseType?: ResponseType;
  isRequired?: boolean;
  options?: string[];
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  order?: number;
  groupId?: string;
  condition?: string;
  conditionValue?: string;
  parentQuestionId?: string;
  hasSubChecklist?: boolean;
  subChecklistId?: string;
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
  createdByName?: string;
  questions?: ChecklistQuestion[];
  groups?: ChecklistGroup[];
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
  origin?: string;
  due_date?: string | null;
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

export interface BatchUpdateResult {
  success: boolean;
  count: number;
}

export interface ChecklistQuestion {
  id: string;
  text: string;
  responseType: ResponseType;
  isRequired: boolean;
  options?: string[];
  weight: number;
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsFiles?: boolean;
  order: number;
  groupId?: string;
  condition?: string;
  conditionValue?: string;
  parentQuestionId?: string;
  hasSubChecklist?: boolean;
  subChecklistId?: string;
  hint?: string;
}

export interface InspectionDetails {
  id: string;
  status: string;
  companyId?: string;
  companyName?: string;
  checklistId?: string;
  checklistTitle?: string;
  createdAt: string;
  updatedAt?: string;
  responsibleId?: string;
  responsibleName?: string;
  scheduledDate?: string;
  location?: string;
  syncStatus?: string;
  metadata?: any;
  title?: string;
  company?: {
    id: string;
    fantasy_name?: string;
  };
  responsible?: {
    id: string;
    name?: string;
  };
  priority?: 'low' | 'medium' | 'high';
  progress?: number;
  description?: string;
}

export interface InspectionFilters {
  status?: string;
  companyId?: string;
  checklistId?: string;
  responsibleId?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  search?: string;
  priority?: 'all' | 'low' | 'medium' | 'high';
}

export interface ChecklistWithQuestions {
  id: string;
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  status?: string;
  companyId?: string;
  responsibleId?: string;
  questions: ChecklistQuestion[];
  groups?: ChecklistGroup[];
}

