
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
    'yes_no': 'yes_no',
    'text': 'text',
    'paragraph': 'paragraph',
    'numeric': 'numeric',
    'dropdown': 'dropdown',
    'multiple_choice': 'multiple_choice',
    'multiple_select': 'multiple_select',
    'date': 'date',
    'time': 'time',
    'datetime': 'datetime'
  };

  return typeMap[frontendType] || 'yes_no';
}

export function databaseToFrontendResponseType(dbType: string): string {
  const typeMap: Record<string, string> = {
    'yes_no': 'yes_no',
    'text': 'text',
    'paragraph': 'paragraph', 
    'numeric': 'numeric',
    'dropdown': 'dropdown',
    'multiple_choice': 'multiple_choice',
    'multiple_select': 'multiple_select',
    'date': 'date',
    'time': 'time',
    'datetime': 'datetime',
    // Mapeamentos para compatibilidade com dados antigos
    'sim/não': 'yes_no',
    'texto': 'text',
    'parágrafo': 'paragraph',
    'numérico': 'numeric',
    'seleção múltipla': 'multiple_choice'
  };

  return typeMap[dbType] || 'yes_no';
}
