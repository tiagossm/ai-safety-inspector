
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
  order: number;
  hasSubChecklist?: boolean;
  subChecklistId?: string;
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
}

export interface ChecklistWithStats extends Checklist {
  totalQuestions?: number;
  completedQuestions?: number;
  groups?: ChecklistGroup[];
  questions?: ChecklistQuestion[];
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
  };
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
