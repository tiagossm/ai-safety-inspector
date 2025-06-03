
// Tipos de resposta padronizados para todo o sistema
export type StandardResponseType = 
  | "yes_no"
  | "text" 
  | "paragraph"
  | "numeric"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "photo"
  | "signature"
  | "date"
  | "time"
  | "datetime";

// Mapeamento entre tipos do frontend e banco de dados
export const RESPONSE_TYPE_MAP = {
  frontend: {
    "yes_no": "sim/não",
    "text": "texto", 
    "paragraph": "parágrafo",
    "numeric": "numérico",
    "multiple_choice": "seleção múltipla",
    "checkboxes": "caixas de seleção",
    "dropdown": "lista suspensa",
    "photo": "foto",
    "signature": "assinatura",
    "date": "data",
    "time": "hora",
    "datetime": "data e hora"
  },
  database: {
    "sim/não": "yes_no",
    "texto": "text",
    "parágrafo": "paragraph",
    "numérico": "numeric", 
    "seleção múltipla": "multiple_choice",
    "caixas de seleção": "checkboxes",
    "lista suspensa": "dropdown",
    "foto": "photo",
    "assinatura": "signature",
    "data": "date",
    "hora": "time",
    "data e hora": "datetime"
  }
} as const;

// Labels para exibição na interface
export const RESPONSE_TYPE_LABELS = {
  "yes_no": "Sim/Não",
  "text": "Texto Curto",
  "paragraph": "Parágrafo",
  "numeric": "Numérico", 
  "multiple_choice": "Múltipla Escolha",
  "checkboxes": "Caixas de Seleção",
  "dropdown": "Lista Suspensa",
  "photo": "Foto",
  "signature": "Assinatura",
  "date": "Data",
  "time": "Hora",
  "datetime": "Data e Hora"
} as const;

// Descrições dos tipos para melhor UX
export const RESPONSE_TYPE_DESCRIPTIONS = {
  "yes_no": "Resposta simples: Sim ou Não",
  "text": "Texto curto em uma linha",
  "paragraph": "Texto longo em múltiplas linhas",
  "numeric": "Apenas números",
  "multiple_choice": "Escolha única entre várias opções",
  "checkboxes": "Múltiplas opções podem ser selecionadas",
  "dropdown": "Lista suspensa com opções",
  "photo": "Captura ou upload de imagem",
  "signature": "Assinatura digital",
  "date": "Seleção de data",
  "time": "Seleção de horário",
  "datetime": "Data e horário combinados"
} as const;

// Validação de tipos de resposta
export function isValidResponseType(type: string): type is StandardResponseType {
  return Object.keys(RESPONSE_TYPE_LABELS).includes(type);
}

// Conversão segura entre tipos - agora com garantia de tipo correto
export function convertToFrontendType(dbType: string): StandardResponseType {
  const converted = RESPONSE_TYPE_MAP.database[dbType as keyof typeof RESPONSE_TYPE_MAP.database];
  
  // Verificar se o resultado é um StandardResponseType válido
  if (converted && isValidResponseType(converted)) {
    return converted as StandardResponseType;
  }
  
  // Fallback garantido para um tipo válido
  return "text";
}

export function convertToDatabaseType(frontendType: StandardResponseType): string {
  return RESPONSE_TYPE_MAP.frontend[frontendType];
}

// Validação de valores de resposta
export function validateResponseValue(type: StandardResponseType, value: any): boolean {
  switch (type) {
    case "numeric":
      return !isNaN(Number(value)) && value !== "";
    case "date":
      return value && !isNaN(Date.parse(value));
    case "time":
      return value && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
    case "datetime":
      return value && !isNaN(Date.parse(value));
    case "yes_no":
      return value === true || value === false || value === "sim" || value === "não";
    case "text":
    case "paragraph":
      return typeof value === "string";
    case "multiple_choice":
    case "dropdown":
      return typeof value === "string" && value.length > 0;
    case "checkboxes":
      return Array.isArray(value);
    default:
      return true;
  }
}

// Tipos que requerem opções
export const TYPES_REQUIRING_OPTIONS: StandardResponseType[] = [
  "multiple_choice",
  "checkboxes", 
  "dropdown"
];

// Tipos que suportam mídia
export const TYPES_SUPPORTING_MEDIA: StandardResponseType[] = [
  "yes_no",
  "text",
  "paragraph",
  "numeric",
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "signature"
];
