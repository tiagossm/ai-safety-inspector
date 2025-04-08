
export interface ChecklistGroup {
  id: string;
  title: string;
  order: number;
}

export interface ChecklistQuestion {
  id: string;
  text: string;
  responseType: "yes_no" | "multiple_choice" | "text" | "numeric" | "photo" | "signature";
  isRequired: boolean;
  groupId?: string;
  order: number;
  weight?: number;
  options?: string[];
  hint?: string | null;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  parentQuestionId?: string | null;
  conditionValue?: string | null;
  hasSubChecklist?: boolean;
  subChecklistId?: string | null;
  displayNumber?: string;
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
  origin?: 'manual' | 'ia' | 'csv';
}

export interface ChecklistWithStats extends Checklist {
  totalQuestions?: number;
  completedQuestions?: number;
  groups?: ChecklistGroup[];
  questions?: ChecklistQuestion[];
  is_sub_checklist?: boolean; // For backward compatibility
  isSubChecklist?: boolean;
  // Support both snake_case and camelCase for backward compatibility
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  origin?: 'manual' | 'ia' | 'csv';
  companyName?: string; // Added companyName property
}

export interface NewChecklistPayload {
  title: string;
  description?: string;
  category?: string;
  isTemplate?: boolean;
  groups?: ChecklistGroup[];
  questions?: ChecklistQuestion[];
  companyId?: string;
  company_id?: string;
  responsibleId?: string;
  dueDate?: string;
  status?: string;
  origin?: 'manual' | 'ia' | 'csv';
}

export interface InspectionDetails {
  id: string;
  title: string;
  description?: string;
  companyId?: string;
  company_id?: string;
  company?: {
    id: string;
    fantasy_name: string;
  };
  responsibleId?: string;
  responsible_id?: string;
  responsible?: {
    id: string;
    name: string;
    email?: string;
  };
  scheduledDate?: string;
  scheduled_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  priority?: 'low' | 'medium' | 'high';
  locationName?: string;
  location?: string;
  checklistId?: string;
  checklist_id?: string;
  progress?: number;
}

export interface InspectionFilters {
  search: string;
  status: string;
  priority?: 'all' | 'low' | 'medium' | 'high';
  company?: string;
  companyId?: string;
  responsibleId?: string;
  checklistId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}
