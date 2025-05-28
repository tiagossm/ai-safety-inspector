
export interface ActionPlanWithRelations {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  assignee?: string | null;
  created_at: string;
  updated_at: string;
  inspection_id: string;
  question_id: string;
  question?: {
    pergunta: string;
  } | null;
  inspection?: {
    id: string;
    company?: {
      id: string;
      fantasy_name?: string;
    };
  };
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string | null;
  assignee?: string | null;
  created_at: string;
  updated_at: string;
  inspection_id: string;
  question_id: string;
}
