
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
    'image': 'imagem',
    // Também cobre se por algum motivo chegar o valor já no padrão banco
    'sim/não': 'sim/não',
    'texto': 'texto',
    'numérico': 'numérico',
    'seleção múltipla': 'seleção múltipla',
    'assinatura': 'assinatura',
    'foto': 'foto',
    'imagem': 'imagem',
    // Possíveis valores aceitos pelo banco mas raramente usados no front
    'multiple_choice': 'multiple_choice',
    'yes_no': 'yes_no',
    'time': 'time',
    'date': 'date'
  };
  return typeMap[frontendType] || 'texto'; // fallback seguro
}

export function databaseToFrontendResponseType(dbType: string): string {
  const typeMap: Record<string, string> = {
    // Banco -> Frontend
    'sim/não': 'yes_no',
    'texto': 'text',
    'numérico': 'numeric',
    'seleção múltipla': 'multiple_choice',
    'foto': 'photo',
    'assinatura': 'signature',
    'imagem': 'image',
    // Se vier o valor "alternativo", também cobre:
    'multiple_choice': 'multiple_choice',
    'yes_no': 'yes_no',
    'time': 'time',
    'date': 'date'
  };
  return typeMap[dbType] || 'text'; // fallback seguro
}
