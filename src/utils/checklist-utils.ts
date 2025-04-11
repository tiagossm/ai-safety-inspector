import { Checklist } from "@/types/newChecklist";

/**
 * Determina a origem do checklist com base nos dados
 */
export function determineChecklistOrigin(checklist: Checklist): 'manual' | 'ia' | 'csv' {
  if (checklist.origin) {
    return checklist.origin;
  }
  
  // Lógica de fallback para determinar origem caso não tenha o campo origin
  // Esta é uma lógica exemplo, adapte conforme necessidade
  if (checklist.description?.includes('Gerado por IA')) {
    return 'ia';
  }
  
  if (checklist.description?.includes('Importado')) {
    return 'csv';
  }
  
  return 'manual';
}

/**
 * Formata a data para exibição amigável
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

/**
 * Calcula a porcentagem de conclusão do checklist
 */
export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Trunca texto para exibição com limite de caracteres
 */
export function truncateText(text: string | undefined | null, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export const getOriginIcon = (checklist?: Checklist) => {
  if (!checklist || !checklist.origin) return null;
  
  switch(checklist.origin) {
    case 'manual':
      return 'manual-icon';
    case 'ia':
      return 'ia-icon';
    case 'csv':
      return 'csv-icon';
    default:
      return null;
  }
};
