import { ChecklistGroup } from '@/types/newChecklist';

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
  origin?: 'manual' | 'ia' | 'csv';
  companyName?: string; // Added company name property
  companyId?: string; // Added company ID for potential future use
  responsibleName?: string; // Optional responsible name
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
  allowsFiles: boolean;
  order: number;
  hasSubChecklist?: boolean;
  subChecklistId?: string;
  displayNumber?: string;  // Numeração hierárquica para exibição (1, 1.1, 1.2, etc)
}

export interface ChecklistGroup {
  id: string;
  title: string;
  order: number;
}

export interface NewChecklistPayload {
  title: string;
  description?: string;
  isTemplate?: boolean;
  status?: string;
  category?: string;
  responsibleId?: string;
  companyId?: string;
  company_id?: string;
  dueDate?: string;
  origin?: 'manual' | 'ia' | 'csv';
}
