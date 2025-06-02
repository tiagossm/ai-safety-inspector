
// Tipos de resposta padronizados para todo o sistema
export type StandardResponseType = 
  | "yes_no"
  | "text" 
  | "numeric"
  | "multiple_choice"
  | "photo"
  | "signature"
  | "date"
  | "time";

// Mapeamento entre tipos do frontend e banco de dados
export const RESPONSE_TYPE_MAP = {
  frontend: {
    "yes_no": "sim/não",
    "text": "texto", 
    "numeric": "numérico",
    "multiple_choice": "seleção múltipla",
    "photo": "foto",
    "signature": "assinatura",
    "date": "data",
    "time": "hora"
  },
  database: {
    "sim/não": "yes_no",
    "texto": "text",
    "numérico": "numeric", 
    "seleção múltipla": "multiple_choice",
    "foto": "photo",
    "assinatura": "signature",
    "data": "date",
    "hora": "time"
  }
} as const;

// Labels para exibição na interface
export const RESPONSE_TYPE_LABELS = {
  "yes_no": "Sim/Não",
  "text": "Texto",
  "numeric": "Numérico", 
  "multiple_choice": "Múltipla Escolha",
  "photo": "Foto",
  "signature": "Assinatura",
  "date": "Data",
  "time": "Hora"
} as const;

// Validação de tipos de resposta
export function isValidResponseType(type: string): type is StandardResponseType {
  return Object.keys(RESPONSE_TYPE_LABELS).includes(type);
}

// Conversão segura entre tipos
export function convertToFrontendType(dbType: string): StandardResponseType {
  const converted = RESPONSE_TYPE_MAP.database[dbType as keyof typeof RESPONSE_TYPE_MAP.database];
  return converted || "text";
}

export function convertToDatabaseType(frontendType: StandardResponseType): string {
  return RESPONSE_TYPE_MAP.frontend[frontendType];
}
