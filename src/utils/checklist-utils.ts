
import { ChecklistWithStats } from "@/types/newChecklist";

/**
 * Determines the origin of a checklist based on its metadata or description
 */
export const determineChecklistOrigin = (checklist: Pick<ChecklistWithStats, 'description' | 'origin'>): 'manual' | 'ia' | 'csv' => {
  // If origin is explicitly set, use it
  if (checklist.origin && ['manual', 'ia', 'csv'].includes(checklist.origin)) {
    return checklist.origin as 'manual' | 'ia' | 'csv';
  }
  
  // Try to determine origin from description
  const description = checklist.description?.toLowerCase() || '';
  
  if (description.includes('gerado por ia') || 
      description.includes('checklist gerado por ia') ||
      description.includes('checklist: ')) {
    return 'ia';
  }
  
  if (description.includes('importado via csv') || 
      description.includes('importado de planilha') ||
      description.includes('importado de excel')) {
    return 'csv';
  }
  
  // Default to manual if no other indicators
  return 'manual';
};

/**
 * Gets a user-friendly label for the checklist origin
 */
export const getOriginLabel = (origin: 'manual' | 'ia' | 'csv'): string => {
  switch (origin) {
    case 'manual':
      return 'Criado Manualmente';
    case 'ia':
      return 'Gerado por IA';
    case 'csv':
      return 'Importado de Planilha';
    default:
      return 'Origem Desconhecida';
  }
};
