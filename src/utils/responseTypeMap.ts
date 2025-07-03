
// Este arquivo mapeia os tipos de resposta entre o frontend e o banco de dados

export function frontendToDatabaseResponseType(frontendType: string): string {
  const typeMap: Record<string, string> = {
    'yes_no': 'sim/não',
    'text': 'texto',
    'numeric': 'numérico',
    'multiple_choice': 'seleção múltipla',
    'photo': 'foto',
    'signature': 'assinatura',
    'time': 'time',
    'date': 'date'
  };

  return typeMap[frontendType] || 'sim/não';
}

export function databaseToFrontendResponseType(dbType: string): string {
  const typeMap: Record<string, string> = {
    'sim/não': 'yes_no',
    'texto': 'text',
    'numérico': 'numeric',
    'seleção múltipla': 'multiple_choice',
    'foto': 'photo',
    'assinatura': 'signature',
    'time': 'time',
    'date': 'date'
  };

  return typeMap[dbType] || 'yes_no';
}
