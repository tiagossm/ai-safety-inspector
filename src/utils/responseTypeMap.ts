
// src/utils/responseTypeMap.ts
// Este arquivo mapeia os tipos de resposta entre o frontend e o banco de dados
// Cobertura total para todos os valores aceitos pela constraint do banco

export function frontendToDatabaseResponseType(frontendType: string): string {
  const typeMap: Record<string, string> = {
    // Frontend -> Banco
    'yes_no': 'sim/não',
    'text': 'texto',
    'numeric': 'numérico',
    'multiple_choice': 'seleção múltipla',
    'photo': 'foto',
    'signature': 'assinatura',
    'image': 'imagem',
    'time': 'hora',
    'date': 'data'
  };
  
  // Verificar se o tipo já está no formato do banco
  if (frontendType === 'sim/não' || 
      frontendType === 'texto' || 
      frontendType === 'numérico' ||
      frontendType === 'seleção múltipla' ||
      frontendType === 'assinatura' ||
      frontendType === 'foto' ||
      frontendType === 'imagem' ||
      frontendType === 'hora' ||
      frontendType === 'data') {
    return frontendType;
  }
  
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
    'hora': 'time',
    'data': 'date'
  };
  
  // Verificar se o tipo já está no formato do frontend
  if (dbType === 'yes_no' || 
      dbType === 'text' || 
      dbType === 'multiple_choice' ||
      dbType === 'numeric' ||
      dbType === 'photo' ||
      dbType === 'signature' ||
      dbType === 'image' ||
      dbType === 'time' ||
      dbType === 'date') {
    return dbType;
  }
  
  return typeMap[dbType] || 'text'; // fallback seguro
}
