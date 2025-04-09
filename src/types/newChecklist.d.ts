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
