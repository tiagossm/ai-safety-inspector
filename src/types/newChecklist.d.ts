
export interface ChecklistWithStats {
  id: string;
  title: string;
  description?: string;
  category?: string;
  is_template: boolean;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  user_id?: string;
  responsible_id?: string;
  company_id?: string;
  due_date?: string;
  parent_question_id?: string;
  is_sub_checklist?: boolean;
  isSubChecklist?: boolean;
  total_questions: number;
  groups?: ChecklistGroup[];
  questions?: ChecklistQuestion[];
  totalQuestions?: number;
  completedQuestions?: number;
  createdAt?: string;
}

export interface ChecklistQuestion {
  id: string;
  text: string;
  type: string;
  responseType?: string;
  isRequired: boolean;
  required?: boolean;
  weight: number;
  order?: number;
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  options?: string[];
  hint?: string;
  parentQuestionId?: string;
  parentId?: string;
  parent_item_id?: string;
  conditionValue?: string;
  condition_value?: string;
  groupId?: string;
  subChecklistId?: string;
  hasSubChecklist?: boolean;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  order?: number;
  questions?: ChecklistQuestion[];
}

export interface NewChecklistPayload {
  title: string;
  description?: string;
  category?: string;
  isTemplate?: boolean;
  groups?: ChecklistGroup[];
  questions?: ChecklistQuestion[];
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
