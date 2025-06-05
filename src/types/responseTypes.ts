
// Tipos padronizados para respostas de checklist
export type StandardResponseType = 
  | "yes_no" 
  | "text" 
  | "paragraph" 
  | "numeric"
  | "multiple_choice" 
  | "checkboxes" 
  | "dropdown" 
  | "date" 
  | "time" 
  | "datetime" 
  | "photo" 
  | "signature";

// Tipos que requerem opções configuradas
export const TYPES_REQUIRING_OPTIONS: StandardResponseType[] = [
  "multiple_choice",
  "checkboxes", 
  "dropdown"
];

// Mapeamento entre tipos do banco de dados e tipos do frontend
const DB_TO_FRONTEND_TYPE_MAP: Record<string, StandardResponseType> = {
  'sim/não': 'yes_no',
  'seleção múltipla': 'multiple_choice',
  'texto': 'text',
  'parágrafo': 'paragraph',
  'numérico': 'numeric',
  'caixas de seleção': 'checkboxes',
  'lista suspensa': 'dropdown',
  'data': 'date',
  'hora': 'time',
  'data e hora': 'datetime',
  'foto': 'photo',
  'assinatura': 'signature',
  // Compatibilidade com valores em inglês também
  'yes_no': 'yes_no',
  'multiple_choice': 'multiple_choice',
  'text': 'text',
  'paragraph': 'paragraph',
  'numeric': 'numeric',
  'checkboxes': 'checkboxes',
  'dropdown': 'dropdown',
  'date': 'date',
  'time': 'time',
  'datetime': 'datetime',
  'photo': 'photo',
  'signature': 'signature'
};

const FRONTEND_TO_DB_TYPE_MAP: Record<StandardResponseType, string> = {
  'yes_no': 'sim/não',
  'multiple_choice': 'seleção múltipla',
  'text': 'texto',
  'paragraph': 'parágrafo',
  'numeric': 'numérico',
  'checkboxes': 'caixas de seleção',
  'dropdown': 'lista suspensa',
  'date': 'data',
  'time': 'hora',
  'datetime': 'data e hora',
  'photo': 'foto',
  'signature': 'assinatura'
};

// Função para converter tipo do banco para o frontend
export function convertToFrontendType(dbType: string): StandardResponseType {
  const normalized = dbType?.toLowerCase?.() || '';
  return DB_TO_FRONTEND_TYPE_MAP[normalized] || DB_TO_FRONTEND_TYPE_MAP[dbType] || 'text';
}

// Função para converter tipo do frontend para o banco
export function frontendToDatabaseResponseType(frontendType: StandardResponseType): string {
  return FRONTEND_TO_DB_TYPE_MAP[frontendType] || 'texto';
}

// Função para validar valor de resposta
export function validateResponseValue(responseType: StandardResponseType, value: any): boolean {
  if (value === null || value === undefined) return false;
  
  switch (responseType) {
    case 'yes_no':
      return ['sim', 'não', 'yes', 'no', true, false].includes(value);
    case 'numeric':
      return !isNaN(Number(value));
    case 'date':
      return !isNaN(Date.parse(value));
    case 'time':
      return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
    case 'multiple_choice':
    case 'checkboxes':
    case 'dropdown':
      return typeof value === 'string' || Array.isArray(value);
    default:
      return typeof value === 'string';
  }
}
