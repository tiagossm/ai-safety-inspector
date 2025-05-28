import { z } from 'zod';
import { toast } from 'sonner';
import { 
  InspectionStatus, 
  InspectionPriority, 
  InspectionType,
  GeoCoordinates
} from '@/types/inspection';

// Schema para coordenadas geográficas
export const geoCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional()
});

// Schema para metadados de inspeção
export const inspectionMetadataSchema = z.object({
  notes: z.string().optional(),
  coordinates: geoCoordinatesSchema.optional().nullable(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional()
}).catchall(z.any());

// Schema para valores do formulário de inspeção
export const inspectionFormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  responsibleIds: z.array(z.string()).min(1, "Pelo menos um responsável é obrigatório"),
  scheduledDate: z.date().nullable().optional(),
  location: z.string().min(1, "Localização é obrigatória"),
  notes: z.string().optional(),
  inspectionType: z.string().min(1, "Tipo de inspeção é obrigatório"),
  priority: z.enum(["low", "medium", "high"] as const),
  coordinates: geoCoordinatesSchema.nullable().optional()
});

// Schema para criação de inspeção
export const createInspectionSchema = z.object({
  checklistId: z.string().min(1, "Checklist é obrigatório"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  responsibleId: z.string().optional(),
  responsibleIds: z.array(z.string()).optional(),
  scheduledDate: z.string().optional().or(z.date().optional()),
  location: z.string().optional(),
  inspectionType: z.string().optional(),
  priority: z.string().optional(),
  metadata: z.any().optional()
}).refine(data => {
  // Pelo menos um responsável deve ser fornecido
  return !!(data.responsibleId || (data.responsibleIds && data.responsibleIds.length > 0));
}, {
  message: "Pelo menos um responsável deve ser fornecido",
  path: ["responsibleIds"]
});

// Schema para atualização de inspeção
export const updateInspectionSchema = z.object({
  id: z.string().min(1, "ID da inspeção é obrigatório"),
  title: z.string().optional(),
  description: z.string().optional(),
  companyId: z.string().optional(),
  responsibleId: z.string().optional(),
  responsibleIds: z.array(z.string()).optional(),
  scheduledDate: z.string().optional().or(z.date().optional()).nullable(),
  location: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "archived"] as const).optional(),
  priority: z.enum(["low", "medium", "high"] as const).optional(),
  inspectionType: z.string().optional(),
  metadata: z.any().optional()
});

// Schema para resposta de inspeção
export const inspectionResponseSchema = z.object({
  inspection_id: z.string().min(1, "ID da inspeção é obrigatório"),
  inspection_item_id: z.string().min(1, "ID do item de inspeção é obrigatório"),
  question_id: z.string().optional(),
  response: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null()
  ]).optional(),
  media_urls: z.array(z.string()).optional()
});

// Schema para assinatura de inspeção
export const inspectionSignatureSchema = z.object({
  inspection_id: z.string().min(1, "ID da inspeção é obrigatório"),
  signer_id: z.string().min(1, "ID do assinante é obrigatório"),
  signer_name: z.string().optional(),
  signer_role: z.string().optional(),
  signature_data: z.string().min(1, "Dados da assinatura são obrigatórios")
});

// Schema para plano de ação
export const actionPlanSchema = z.object({
  inspection_id: z.string().min(1, "ID da inspeção é obrigatório"),
  question_id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  status: z.enum(["pending", "in_progress", "completed", "canceled"] as const),
  priority: z.enum(["low", "medium", "high"] as const),
  due_date: z.string().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  assigned_to_name: z.string().optional()
});

// Schema para opções de relatório
export const reportOptionsSchema = z.object({
  inspectionId: z.string().min(1, "ID da inspeção é obrigatório"),
  format: z.enum(["pdf", "excel", "csv"] as const),
  includeMedia: z.boolean().optional(),
  includeSignatures: z.boolean().optional(),
  includeActionPlans: z.boolean().optional(),
  customTitle: z.string().optional(),
  customLogo: z.string().optional(),
  customFooter: z.string().optional()
});

// Tipo para resultado de validação
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]> | null;
}

/**
 * Função para validar dados de inspeção
 * @param data Dados a serem validados
 * @param schema Schema de validação
 * @returns Resultado da validação
 */
export function validateWithSchema<T>(data: any, schema: z.ZodType<T>): ValidationResult {
  try {
    schema.parse(data);
    return { valid: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });
      
      // Mostrar erros no toast
      Object.values(formattedErrors).flat().forEach(errorMsg => {
        toast.error(errorMsg);
      });
      
      return { valid: false, errors: formattedErrors };
    }
    
    toast.error("Erro de validação desconhecido");
    return { 
      valid: false, 
      errors: { _general: ["Erro de validação desconhecido"] } 
    };
  }
}

/**
 * Função para validar formulário de inspeção
 * @param data Dados do formulário
 * @returns Resultado da validação
 */
export function validateInspectionForm(data: any): ValidationResult {
  return validateWithSchema(data, inspectionFormSchema);
}

/**
 * Função para validar criação de inspeção
 * @param data Dados de criação
 * @returns Resultado da validação
 */
export function validateCreateInspection(data: any): ValidationResult {
  return validateWithSchema(data, createInspectionSchema);
}

/**
 * Função para validar atualização de inspeção
 * @param data Dados de atualização
 * @returns Resultado da validação
 */
export function validateUpdateInspection(data: any): ValidationResult {
  return validateWithSchema(data, updateInspectionSchema);
}

/**
 * Função para validar resposta de inspeção
 * @param data Dados da resposta
 * @returns Resultado da validação
 */
export function validateInspectionResponse(data: any): ValidationResult {
  return validateWithSchema(data, inspectionResponseSchema);
}

/**
 * Função para validar assinatura de inspeção
 * @param data Dados da assinatura
 * @returns Resultado da validação
 */
export function validateInspectionSignature(data: any): ValidationResult {
  return validateWithSchema(data, inspectionSignatureSchema);
}

/**
 * Função para validar plano de ação
 * @param data Dados do plano de ação
 * @returns Resultado da validação
 */
export function validateActionPlan(data: any): ValidationResult {
  return validateWithSchema(data, actionPlanSchema);
}

/**
 * Função para validar opções de relatório
 * @param data Opções de relatório
 * @returns Resultado da validação
 */
export function validateReportOptions(data: any): ValidationResult {
  return validateWithSchema(data, reportOptionsSchema);
}

/**
 * Função simplificada para validação básica de inspeção
 * Mantida para compatibilidade com código existente
 */
export function validateBasicInspection(
  companyId: string, 
  responsibleIds: string[], 
  location: string,
  inspectionType: string
): boolean {
  if (!companyId) {
    toast.error("Empresa é obrigatória");
    return false;
  }
  
  if (!responsibleIds || responsibleIds.length === 0) {
    toast.error("Pelo menos um responsável é obrigatório");
    return false;
  }
  
  if (!location) {
    toast.error("Localização é obrigatória");
    return false;
  }
  
  if (!inspectionType) {
    toast.error("Tipo de inspeção é obrigatório");
    return false;
  }
  
  return true;
}

