
export interface NewChecklistPayload {
  title: string;
  description: string;
  is_template: boolean;
  status: "active" | "inactive";
  category: string;
  company_id?: string | null;
  responsible_id?: string | null;
  due_date?: string | null;
  user_id?: string | null;
  status_checklist?: "ativo" | "inativo";
  origin?: 'manual' | 'ia' | 'csv';
}

export interface ChecklistFilters {
  search: string;
  status: string;
  priority: string;
  companyId: string;
  responsibleId: string;
  checklistId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface InspectionDetails {
  id: string;
  title: string;
  description: string;
  checklistId: string;
  companyId: string;
  responsibleId: string;
  scheduledDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
  locationName: string;
  company: any | null;
  responsible: any | null;
  progress: number;
  totalItems: number;
  completedItems: number;
  approval_notes: string | null;
  approval_status: string | null;
  approved_by: string | null;
  audio_url: string | null;
  photos: string[];
  report_url: string | null;
  unit_id: string | null;
  metadata: any | null;
  cnae: string | null;
  inspection_type: string | null;
  sync_status: string | null;
  companyName: string | null;
  responsibleName: string | null;
}

export interface ChecklistWithStats {
  id: string;
  title: string;
  description: string;
  is_template: boolean;
  isTemplate: boolean;
  status: "active" | "inactive";
  category: string;
  responsible_id: string | null;
  responsibleId: string | null;
  company_id: string | null;
  companyId: string | null;
  user_id: string | null;
  userId: string | null;
  created_at: string;
  createdAt: string;
  updated_at: string;
  updatedAt: string;
  due_date: string | null;
  dueDate: string | null;
  is_sub_checklist: boolean;
  isSubChecklist: boolean;
  origin: ChecklistOrigin;
  parent_question_id: string | null;
  parentQuestionId: string | null;
  totalQuestions: number;
  completedQuestions: number;
  companyName: string | null;
  responsibleName: string | null;
  questions?: ChecklistQuestion[];
  groups?: ChecklistGroup[];
}

// Interface for question groups in checklists
export interface ChecklistGroup {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions?: Array<ChecklistQuestion>;
}

// Adding additional interfaces and types needed for the application

export type ChecklistOrigin = 'manual' | 'ia' | 'csv';

export interface Checklist {
  id: string;
  title: string;
  description: string;
  is_template: boolean;
  status: "active" | "inactive";
  category: string;
  responsible_id: string | null;
  company_id: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  is_sub_checklist: boolean;
  parent_question_id: string | null;
  origin: ChecklistOrigin;
  status_checklist: "ativo" | "inativo";
}

export interface ChecklistQuestion {
  id: string;
  text: string;
  responseType: string;
  isRequired: boolean;
  weight: number;
  order: number;
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsFiles: boolean;
  options?: string[];
  hint?: string | null;
  groupId?: string;
  parentQuestionId?: string | null;
  hasSubChecklist?: boolean;
  subChecklistId?: string | null;
  displayNumber?: string;
  conditionValue?: string | null;
}

export interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => Promise<void>;
  isDeleting?: boolean;
}

export interface InspectionFilters {
  search: string;
  status: string;
  priority: string;
  companyId: string;
  responsibleId: string;
  checklistId: string;
  startDate?: Date;
  endDate?: Date;
}

export type AIAssistantType = 'general' | 'workplace-safety' | 'compliance' | 'quality' | 'checklist' | 'openai';

export interface NewChecklist {
  title: string;
  description?: string;
  is_template?: boolean;
  status?: "active" | "inactive";
  status_checklist?: "ativo" | "inativo";
  category?: string;
  company_id?: string | null;
  responsible_id?: string | null;
  due_date?: string | null;
  user_id?: string | null;
  origin?: ChecklistOrigin;
}
