/**
 * Tipos relacionados ao módulo de inspeções
 * Definições centralizadas para garantir consistência
 */

// Enums para valores constantes
export enum InspectionStatusEnum {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ARCHIVED = "archived"
}

export enum InspectionPriorityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export enum InspectionTypeEnum {
  INTERNAL = "internal",
  EXTERNAL = "external",
  AUDIT = "audit",
  ROUTINE = "routine",
  CUSTOM = "custom"
}

// Tipos de status para compatibilidade com código existente
export type InspectionStatus = 'pending' | 'in_progress' | 'completed' | 'archived';
export type InspectionPriority = 'low' | 'medium' | 'high';
export type InspectionType = 'internal' | 'external' | 'audit' | 'routine' | 'custom';

// Mapeamento de status para exibição
export const INSPECTION_STATUSES: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  ARCHIVED: "Arquivado"
};

// Interface para coordenadas geográficas
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Interface para metadados de inspeção
export interface InspectionMetadata {
  notes?: string;
  coordinates?: GeoCoordinates;
  tags?: string[];
  customFields?: Record<string, any>;
  [key: string]: any;
}

// Interface para empresa associada à inspeção
export interface InspectionCompany {
  id: string;
  fantasy_name?: string;
  cnpj?: string;
  name?: string;
}

// Interface para responsável pela inspeção
export interface InspectionResponsible {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

// Interface para checklist associado à inspeção
export interface InspectionChecklist {
  id: string;
  title?: string;
  description?: string;
}

// Interface para resposta de inspeção
export interface InspectionResponse {
  id?: string;
  inspection_id: string;
  inspection_item_id: string;
  question_id?: string;
  response?: string | number | boolean | null;
  media_urls?: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// Interface para assinatura de inspeção
export interface InspectionSignature {
  id?: string;
  inspection_id: string;
  signer_id: string;
  signer_name?: string;
  signer_role?: string;
  signature_data: string;
  created_at?: string;
}

// Interface para plano de ação
export interface ActionPlan {
  id?: string;
  inspection_id: string;
  question_id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  inspection?: {
    id: string;
    title?: string;
    company?: {
      id: string;
      fantasy_name?: string;
    }
  };
}

// Interface para log de auditoria
export interface InspectionAuditLog {
  id?: string;
  inspection_id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  created_at?: string;
}

// Interface para inspeção (modelo de dados)
export interface Inspection {
  id: string;
  title?: string;
  description?: string;
  checklist_id: string;
  company_id?: string;
  responsible_id?: string;
  responsible_ids?: string[];
  scheduled_date?: string | null;
  location?: string;
  status: InspectionStatus;
  priority: InspectionPriority;
  inspection_type?: InspectionType;
  metadata?: InspectionMetadata | string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  sync_status?: string;
  
  // Relações
  checklist?: InspectionChecklist;
  company?: InspectionCompany;
  responsible?: InspectionResponsible;
}

// Interface para detalhes de inspeção (para UI)
export interface InspectionDetails {
  id: string;
  title?: string;
  description?: string;
  checklistId?: string;
  checklistTitle?: string;
  companyId?: string;
  companyName?: string;
  responsibleId?: string;
  responsibleName?: string;
  scheduledDate?: string;
  location?: string;
  status: InspectionStatus;
  priority: InspectionPriority;
  inspectionType?: InspectionType;
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
  totalQuestions?: number;
  completedQuestions?: number;
  metadata?: InspectionMetadata;
  
  // Relações
  company?: {
    id: string;
    fantasy_name?: string;
  };
  responsible?: {
    id: string;
    name?: string;
  };
  checklist?: {
    id: string;
    title?: string;
  };
}

// Interface para filtros de inspeção
export interface InspectionFilters {
  status?: string;
  companyId?: string;
  checklistId?: string;
  responsibleId?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  search?: string;
  priority?: 'all' | 'low' | 'medium' | 'high';
}

// Interface para valores do formulário de inspeção
export interface InspectionFormValues {
  title?: string;
  description?: string;
  companyId?: string;
  responsibleIds?: string[];
  scheduledDate?: Date | null;
  location?: string;
  notes?: string;
  inspectionType: string;
  priority: InspectionPriority;
  coordinates?: GeoCoordinates | null;
}

// Interface para opções de relatório
export interface ReportOptions {
  inspectionId: string;
  format: 'pdf' | 'excel' | 'csv';
  includeMedia?: boolean;
  includeSignatures?: boolean;
  includeActionPlans?: boolean;
  customTitle?: string;
  customLogo?: string;
  customFooter?: string;
}

// Interface para estatísticas de planos de ação
export interface ActionPlanStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  canceled: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  overdue: number;
}

// Interface para filtros de planos de ação
export interface ActionPlanFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  searchTerm?: string;
}

// Interface para parâmetros de criação de inspeção
export interface CreateInspectionParams {
  checklistId: string;
  companyId?: string;
  responsibleId?: string;
  responsibleIds?: string[];
  scheduledDate?: string | Date;
  location?: string;
  inspectionType?: string;
  priority?: string;
  metadata?: any;
}

