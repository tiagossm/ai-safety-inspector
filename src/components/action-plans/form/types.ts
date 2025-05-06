
export interface ActionPlanFormData {
  description: string;
  assignee?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ActionPlan {
  id: string;
  description: string;
  assignee?: string;
  due_date?: string;
  priority: string;
  status: string;
  inspection_id?: string;
  question_id?: string;
  created_at?: string;
  updated_at?: string;
}
