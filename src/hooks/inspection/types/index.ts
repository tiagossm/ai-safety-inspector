// Tipos centralizados para o módulo de inspeções

export interface InspectionResponse {
  value?: any;
  comment?: string;
  comments?: string;
  actionPlan?: string;
  notes?: string;
  mediaUrls?: string[];
  subChecklistResponses?: Record<string, any> | string;
  updatedAt?: string;
  createdAt?: string;
}

export interface Question {
  id: string;
  groupId?: string;
  pergunta: string;
  tipo_resposta: string;
  responseType?: string;
  opcoes?: any;
  options?: string[];
  obrigatorio?: boolean;
  required?: boolean;
  permite_foto?: boolean;
  permite_video?: boolean;
  permite_audio?: boolean;
  permite_files?: boolean;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  ordem?: number;
  order?: number;
  weight?: number;
  hint?: string;
  parent_item_id?: string;
  condition_value?: string;
  has_subchecklist?: boolean;
  sub_checklist_id?: string;
  path?: string;
}

export interface Inspection {
  id: string;
  status: string;
  checklist_id?: string;
  company_id?: string;
  responsible_id?: string;
  responsible_ids?: string[];
  user_id: string;
  location?: string;
  metadata?: any;
  created_at: string;
  updated_at?: string;
  inspectorName?: string;
  inspectorTitle?: string;
  companyName?: string;
  responsibleName?: string;
}

export interface Company {
  id: string;
  fantasy_name?: string;
  cnpj?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface Responsible {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface InspectionFetchResult {
  loading: boolean;
  error: string | null;
  detailedError?: any;
  inspection: Inspection | null;
  questions: Question[];
  groups: any[];
  responses: Record<string, InspectionResponse>;
  company: Company | null;
  responsible: Responsible | null;
  responsibles: Responsible[];
  subChecklists: Record<string, any>;
}

export interface MediaUploadOptions {
  inspectionId: string;
  questionId: string;
  file: File;
  bucketName?: string;
}

export interface SaveInspectionOptions {
  autoSave?: boolean;
  skipValidation?: boolean;
  showToast?: boolean;
}

// Types para analytics e métricas
export interface InspectionMetrics {
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  mediaCount: number;
  actionPlansCount: number;
  lastSaved?: Date;
  timeSpent?: number;
}

// Types para auto-save
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // em segundos
  debounceDelay: number; // em ms
  maxRetries: number;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  pendingChanges: boolean;
  errorCount: number;
}