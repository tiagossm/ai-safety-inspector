
import { Json } from "@/integrations/supabase/types";

export interface ChecklistQuestion {
  id: string;
  text: string;
  type: string;
  responseType?: string;
  isRequired?: boolean;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  options?: string[] | any;
  hint?: string;
  weight?: number;
  parentQuestionId?: string | null;
  conditionValue?: string | null;
  groupId?: string | null;
  subChecklistId?: string | null;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  description?: string;
  order?: number;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  is_template?: boolean;
  company_id?: string | null;
  created_by?: string;
  is_sub_checklist?: boolean;
  parent_question_id?: string | null;
  
  // Add the missing properties that were causing TypeScript errors
  questions?: ChecklistQuestion[];
  groups?: ChecklistGroup[];
  items?: any[]; // For compatibility with different API responses
}

export interface ChecklistResponse {
  id: string;
  checklist_id: string;
  question_id: string;
  inspection_id: string;
  response: string | boolean | number | null;
  notes?: string;
  media_urls?: string[];
  created_at?: string;
  updated_at?: string;
  requires_action?: boolean;
  action_plan?: string;
  action_responsible?: string;
  action_deadline?: string;
  action_status?: 'pending' | 'in_progress' | 'completed';
}
