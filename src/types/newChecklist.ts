
export interface ChecklistGroup {
  id: string;
  title: string;
  order: number;
}

export interface ChecklistQuestion {
  id: string;
  text: string;
  responseType: 'yes_no' | 'multiple_choice' | 'text' | 'numeric' | 'photo' | 'signature';
  isRequired: boolean;
  options?: string[];
  hint?: string;
  weight: number;
  groupId?: string;
  parentQuestionId?: string;
  conditionValue?: string;
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsFiles?: boolean;
  order: number;
  hasSubChecklist?: boolean;
  subChecklistId?: string;
  displayNumber?: string;  // Numeração hierárquica para exibição (1, 1.1, 1.2, etc)
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  isTemplate: boolean;
  status: 'active' | 'inactive';
  category?: string;
  responsibleId?: string | null;
  companyId?: string | null;
  userId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string | null;
  isSubChecklist?: boolean;
}

export interface ChecklistWithStats extends Checklist {
  totalQuestions?: number;
  completedQuestions?: number;
  groups?: ChecklistGroup[];
  questions?: ChecklistQuestion[];
  is_sub_checklist?: boolean; // For backward compatibility
}

export interface NewChecklistPayload {
  title: string;
  description?: string;
  isTemplate?: boolean;
  status?: 'active' | 'inactive';
  category?: string;
  responsibleId?: string | null;
  companyId?: string | null;
  dueDate?: string | null;
}

export interface InspectionDetails {
  id: string;
  title: string;
  description?: string;
  checklistId: string;
  companyId?: string;
  locationName?: string;
  responsibleId?: string;
  scheduledDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  checklist?: {
    title?: string;
    description?: string;
    total_questions?: number;
  } | Record<string, any>;
  // Additional fields to match database schema
  approval_notes?: string | null;
  approval_status?: string;
  approved_by?: string | null;
  audio_url?: string | null;
  photos?: string[];
  report_url?: string | null;
  unit_id?: string | null;
  metadata?: Record<string, any>;
  cnae?: string;
  inspection_type?: string;
  sync_status?: string;
  // Non-DB fields for UI display
  company?: {
    id?: string;
    name?: string;
    fantasy_name?: string;
  };
  responsible?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  progress?: number;
}

export interface InspectionResponse {
  id: string;
  inspectionId: string;
  questionId: string;
  answer?: string;
  notes?: string;
  actionPlan?: string;
  mediaUrls?: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InspectionFilters {
  search: string;
  status: "all" | "pending" | "in_progress" | "completed";
  priority: "all" | "low" | "medium" | "high";
  companyId: string;
  responsibleId: string;
  checklistId: string;
  startDate?: Date;
  endDate?: Date;
}
