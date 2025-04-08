
import { ChecklistGroup } from '@/types/newChecklist';

export interface ChecklistWithStats extends Checklist {
  totalQuestions?: number;
  completedQuestions?: number;
  groups?: ChecklistGroup[];
  questions?: ChecklistQuestion[];
  is_sub_checklist?: boolean; // For backward compatibility
  isSubChecklist?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  origin?: 'manual' | 'ia' | 'csv';
  companyName?: string; // Added company name property
  companyId?: string; // Added company ID for potential future use
  responsibleName?: string; // Optional responsible name
}
