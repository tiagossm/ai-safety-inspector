// src/utils/responseTypeMap.ts
// Este arquivo mapeia os tipos de resposta entre o frontend e o banco de dados
// Cobertura total para todos os valores aceitos pela constraint do banco

export function frontendToDatabaseResponseType(frontendType: string): string {
  const typeMap: Record<string, string> = {
    'sim/não': 'sim/não',
    'texto': 'texto',
    'numérico': 'numérico',
    'seleção múltipla': 'seleção múltipla',
    'foto': 'foto',
    'assinatura': 'assinatura',
    'hora': 'hora',
    'data': 'data',
    // Mapeamentos legados para compatibilidade
    'yes_no': 'sim/não',
    'text': 'texto',
    'numeric': 'numérico',
    'multiple_choice': 'seleção múltipla',
    'photo': 'foto',
    'signature': 'assinatura',
    'time': 'hora',
    'date': 'data'
  };
  return typeMap[frontendType] || 'texto';
}

export function databaseToFrontendResponseType(dbType: string): string {
  const typeMap: Record<string, string> = {
    'sim/não': 'sim/não',
    'texto': 'texto',
    'numérico': 'numérico',
    'seleção múltipla': 'seleção múltipla',
    'foto': 'foto',
    'assinatura': 'assinatura',
    'hora': 'hora',
    'data': 'data'
  };
  return typeMap[dbType] || 'texto';
}
