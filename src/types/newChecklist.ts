// Base checklist types
export interface Checklist {
  id: string;
  title: string;
  description?: string;
  is_template: boolean;
  status: "active" | "inactive";
  category?: string;
  responsible_id?: string | null;
  company_id?: string | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  due_date?: string | null;
  is_sub_checklist?: boolean;
  origin?: ChecklistOrigin;
  parent_question_id?: string | null;
}

export type ChecklistOrigin = "manual" | "ia" | "csv";

export interface ChecklistWithStats extends Checklist {
  totalQuestions: number;
  completedQuestions: number;
  companyName?: string;
  responsibleName?: string;
  questions?: ChecklistQuestion[];
  groups?: ChecklistGroup[];
  
  // These are for backward compatibility with existing code
  isTemplate?: boolean;
  isSubChecklist?: boolean;
  companyId?: string;
  responsibleId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
}

// Question and group types
export interface ChecklistQuestion {
  id: string;
  text: string;
  responseType: "yes_no" | "numeric" | "text" | "multiple_choice" | "photo" | "signature";
  isRequired: boolean;
  options?: string[];
  order: number;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  weight?: number;
  groupId?: string;
  parentId?: string | null;
  conditionValue?: string | null;
  displayNumber?: string;
  
  // Additional properties needed by components
  parentQuestionId?: string | null;
  hint?: string;
  hasSubChecklist?: boolean;
  subChecklistId?: string;
}

// Inspection types
export interface InspectionDetails {
  id: string;
  title: string;
  description?: string;
  checklistId: string;
  companyId: string;
  responsibleId?: string;
  scheduledDate?: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
  priority: "low" | "medium" | "high";
  locationName?: string;
  company?: { id: string; name: string; fantasy_name?: string };
  responsible?: { id: string; name: string; email?: string };
  progress: number;
  totalItems: number;
  completedItems: number;
  approval_notes?: string;
  approval_status?: string;
  approved_by?: string;
  audio_url?: string;
  photos?: string[];
  report_url?: string;
  unit_id?: string;
  metadata?: any;
  cnae?: string;
  inspection_type?: string;
  sync_status?: string;
  companyName?: string;
  responsibleName?: string;
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

// Delete dialog props
export interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => Promise<void>;
  isDeleting: boolean;
}

// Checklist creation payload
export interface NewChecklistPayload {
  title: string;
  description?: string;
  is_template: boolean;
  status: string;
  status_checklist?: "ativo" | "inativo";
  category?: string;
  company_id?: string | null;
  responsible_id?: string | null;
  due_date?: string | null;
  user_id?: string | null;
  origin?: ChecklistOrigin;
}

// Define AI Assistant type used across components
export type AIAssistantType = "general" | "workplace-safety" | "compliance" | "quality" | "checklist" | "openai";
