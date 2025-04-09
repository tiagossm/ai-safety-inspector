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
  origin: 'manual' | 'ia' | 'csv';
  parent_question_id: string | null;
  parentQuestionId: string | null;
  totalQuestions: number;
  completedQuestions: number;
  companyName: string | null;
  responsibleName: string | null;
}

// Interface para grupos de perguntas em checklists
export interface ChecklistGroup {
  id: string;
  title: string;
  description?: string;
  questions: Array<{
    id?: string;
    text: string;
    type: string;
    required: boolean;
    allowPhoto?: boolean;
    allowVideo?: boolean;
    allowAudio?: boolean;
    options?: string[];
    hint?: string;
    weight?: number;
    parentId?: string;
    conditionValue?: string;
    groupId?: string;
  }>;
}
