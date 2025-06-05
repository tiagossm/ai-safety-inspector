
import { StandardResponseType } from "./responseTypes";

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
  origin?: 'manual' | 'ia' | 'csv';
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
  status_checklist?: "ativo" | "inativo";
  category?: string;
  company_id?: string | null;
  responsible_id?: string | null;
  status?: string;
  due_date?: string | null;
  origin?: 'manual' | 'ia' | 'csv';
}

export interface BatchUpdateResult {
  success: boolean;
  count: number;
}

// Interface atualizada para usar StandardResponseType e incluir todas as propriedades necessárias
export interface ChecklistQuestion {
  id: string;
  text: string;
  responseType: StandardResponseType;
  isRequired: boolean;
  order: number;
  weight: number;
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsFiles: boolean;
  groupId: string;
  parentQuestionId?: string;
  level?: number;
  path?: string;
  isConditional: boolean;
  options: string[]; // Mantém compatibilidade
  multipleChoiceOptions?: import("@/types/multipleChoice").ChecklistItemOption[]; // Opções avançadas
  hint?: string;
  displayCondition?: {
    parentQuestionId: string;
    expectedValue: string;
  };
  conditionalQuestions?: ChecklistQuestion[];
  // Propriedades para suporte a sub-checklists
  hasSubChecklist?: boolean;
  subChecklistId?: string;
  // Propriedade para compatibilidade com hooks existentes
  conditionValue?: string;
}

// Extended InspectionDetails interface with all required properties
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

// Extended InspectionFilters interface with necessary properties
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
