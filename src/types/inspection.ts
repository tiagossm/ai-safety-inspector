
export interface InspectionResponse {
  id: string;
  inspection_id: string;
  inspection_item_id: string;
  answer: string;
  comments?: string;
  notes?: string;
  action_plan?: string;
  media_urls?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  sub_checklist_responses?: any;
  inspection_items?: {
    id: string;
    pergunta: string;
    type?: string;
    description?: string;
    template_item_id?: string;
    created_at: string;
  };
}

export interface InspectionActionPlan {
  id: string;
  inspection_id: string;
  question_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee?: string;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface InspectionSignature {
  inspection_id: string;
  signer_id: string;
  signer_name?: string;
  signer_role?: string;
  signature_data: string;
  signed_at?: string;
  created_at: string;
  users?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface ReportOptions {
  inspectionId: string;
  format: 'pdf' | 'excel' | 'csv';
  includeMedia?: boolean;
  includeSignatures?: boolean;
  includeActionPlans?: boolean;
  customTitle?: string;
  customFooter?: string;
}
