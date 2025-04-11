
export type QuestionType = 
  | 'sim/não' 
  | 'múltipla escolha' 
  | 'texto' 
  | 'numérico' 
  | 'foto' 
  | 'assinatura';

export interface ChecklistWithStats {
  id: string;
  title: string;
  description?: string;
  isTemplate: boolean;
  is_template: boolean; // Added to satisfy transformation requirements
  status: string;
  category?: string;
  theme?: string;
  responsibleId?: string;
  companyId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  isSubChecklist?: boolean;
  origin?: 'manual' | 'ia' | 'csv' | string;
  totalQuestions: number;
  completedQuestions?: number;
  companyName?: string;
  responsibleName?: string;
  
  // Add these properties to fix errors
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
  theme?: string;
  company_id?: string;
  responsible_id?: string;
  origin?: 'manual' | 'ia' | 'csv' | string;
  dueDate?: string;
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
  theme?: string;
  questions?: ChecklistItem[];
  groups?: ChecklistGroup[];
  responsibleName?: string;
  origin?: 'manual' | 'ia' | 'csv' | string; // Updated to accept string
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
  permite_files?: boolean; // Added for file uploads
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
  status_checklist?: "ativo" | "inativo";
  category?: string;
  theme?: string;
  company_id?: string | null;
  responsible_id?: string | null;
  status?: string;
}

export interface BatchUpdateResult {
  success: boolean;
  count: number;
}

// Updated InspectionDetails to include all missing properties
export interface InspectionDetails {
  id: string;
  title: string;
  status: string;
  date: string;
  company: string | { fantasy_name?: string };
  location?: string;
  inspector?: string;
  completedItems?: number;
  totalItems: number;
  
  // Add missing properties that are used in components
  description?: string;
  checklistId?: string;
  companyId?: string;
  responsibleId?: string;
  scheduledDate?: string;
  priority?: string;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
  responsible?: { name?: string };
}

// Updated InspectionFilters to include all needed properties
export interface InspectionFilters {
  status?: string;
  dateRange?: [Date | null, Date | null];
  company?: string;
  location?: string;
  inspector?: string;
  
  // Add missing properties that are used in filters
  search?: string;
  priority?: string;
  companyId?: string;
  responsibleId?: string;
  checklistId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Updated ChecklistQuestion interface
export interface ChecklistQuestion {
  id: string;
  text: string;
  responseType: string;
  isRequired: boolean;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  options?: string[] | any; // Using any to accommodate Json type
  hint?: string;
  weight?: number;
  order: number;
  groupId?: string;
  parentQuestionId?: string;
  subChecklistId?: string;
  hasSubChecklist?: boolean;
  displayNumber?: string;
  parentId?: string;
  conditionValue?: string;
}

// Update DeleteChecklistDialogProps interface to include isDeleting
export interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => Promise<void>;
  isDeleting?: boolean; // Made optional
}
