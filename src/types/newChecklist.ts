
export type ResponseType = 
  | "sim/não" 
  | "texto" 
  | "numérico" 
  | "seleção múltipla" 
  | "foto" 
  | "assinatura" 
  | "data" 
  | "hora";

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

export interface ChecklistGroup {
  id: string;
  title: string;
  order: number;
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
