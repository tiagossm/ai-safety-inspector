
// Este arquivo mapeia os tipos de resposta entre o frontend e o banco de dados

// Tipos de resposta padronizados do sistema
export const STANDARD_RESPONSE_TYPES = [
  { value: "text", label: "Texto" },
  { value: "paragraph", label: "Parágrafo" },
  { value: "numeric", label: "Numérico" },
  { value: "yes_no", label: "Sim / Não" },
  { value: "dropdown", label: "Lista Suspensa" },
  { value: "multiple_choice", label: "Seleção Múltipla" },
  { value: "multiple_select", label: "Seleção Múltipla (Caixas)" },
  { value: "date", label: "Data" },
  { value: "time", label: "Hora" },
  { value: "datetime", label: "Data e Hora" },
] as const;

export function frontendToDatabaseResponseType(frontendType: string): string {
  const typeMap: Record<string, string> = {
    'yes_no': 'sim/não',
    'text': 'texto',
    'paragraph': 'texto',
    'numeric': 'numérico',
    'dropdown': 'seleção múltipla',
    'multiple_choice': 'seleção múltipla',
    'multiple_select': 'seleção múltipla',
    'date': 'date',
    'time': 'time',
    'datetime': 'datetime'
  };

  return typeMap[frontendType] || 'sim/não';
}

export function databaseToFrontendResponseType(dbType: string): string {
  const typeMap: Record<string, string> = {
    'sim/não': 'yes_no',
    'texto': 'text',
    'numérico': 'numeric',
    'seleção múltipla': 'multiple_choice',
    'date': 'date',
    'time': 'time',
    'datetime': 'datetime'
  };

  return typeMap[dbType] || 'yes_no';
}
