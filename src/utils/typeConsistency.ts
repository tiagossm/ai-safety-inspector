
// Utility to ensure consistent type usage across the application

import { ChecklistQuestion } from "@/types/newChecklist";

export const PORTUGUESE_QUESTION_TYPES = [
  "sim/não",
  "texto", 
  "numérico",
  "seleção múltipla",
  "foto",
  "assinatura",
  "hora",
  "data"
] as const;

export type PortugueseQuestionType = typeof PORTUGUESE_QUESTION_TYPES[number];

// Convert any type to our consistent Portuguese format
export function normalizeToPortugueseType(type: string): PortugueseQuestionType {
  const typeMap: Record<string, PortugueseQuestionType> = {
    // Portuguese (correct)
    'sim/não': 'sim/não',
    'texto': 'texto',
    'numérico': 'numérico', 
    'seleção múltipla': 'seleção múltipla',
    'foto': 'foto',
    'assinatura': 'assinatura',
    'hora': 'hora',
    'data': 'data',
    
    // English (legacy)
    'yes_no': 'sim/não',
    'text': 'texto',
    'numeric': 'numérico',
    'multiple_choice': 'seleção múltipla',
    'photo': 'foto',
    'signature': 'assinatura',
    'time': 'hora',
    'date': 'data'
  };
  
  return typeMap[type] || 'texto';
}

export function createDefaultQuestion(): ChecklistQuestion {
  return {
    id: '',
    text: '',
    responseType: 'sim/não',
    isRequired: true,
    weight: 1,
    allowsPhoto: false,
    allowsVideo: false,
    allowsAudio: false,
    allowsFiles: false,
    order: 0,
    options: []
  };
}
