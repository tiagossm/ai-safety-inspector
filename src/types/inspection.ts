
export type InspectionStatus = 'Pendente' | 'Em Andamento' | 'Concluído';

export const INSPECTION_STATUSES: Record<string, InspectionStatus> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído'
} as const;

// Mapeamento para o banco de dados (minúsculo)
export const INSPECTION_STATUSES_DB: Record<string, string> = {
  PENDING: 'pendente',
  IN_PROGRESS: 'em_andamento', 
  COMPLETED: 'concluido'
} as const;

export interface Signature {
  inspection_id: string;
  signer_id: string;
  signer_name?: string;
  signature_data: string;
  signed_at: string;
}

export interface Report {
  id: string;
  inspection_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  action_plan: any;
  url?: string;
  format?: string;
  inspection?: {
    id: string;
    status: string;
    company?: {
      fantasy_name: string;
    };
    checklist?: {
      title: string;
    };
  };
}

export interface ActionPlan {
  id?: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  assignee?: string;
  question_id?: string;
  inspection_id?: string;
  created_at?: string;
  updated_at?: string;
}
