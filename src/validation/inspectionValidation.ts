
import { ReportOptions } from "@/types/inspection";

export function validateReportOptions(options: ReportOptions): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!options.inspectionId) {
    errors.push("ID da inspeção é obrigatório");
  }
  
  if (!options.format || !['pdf', 'excel', 'csv'].includes(options.format)) {
    errors.push("Formato de relatório deve ser pdf, excel ou csv");
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}
