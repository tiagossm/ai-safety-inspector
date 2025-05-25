
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
    'date': 'data',
    'image': 'foto',
    'imagem': 'foto'
  };
  
  console.log(`[responseTypeMap] Converting frontend type "${frontendType}" to database type "${typeMap[frontendType] || 'texto'}"`);
  return typeMap[frontendType] || 'texto'; // fallback seguro
}

export function databaseToFrontendResponseType(dbType: string): string {
  const typeMap: Record<string, string> = {
    // Banco -> Frontend
    'sim/não': 'sim/não',
    'texto': 'texto',
    'numérico': 'numérico', 
    'seleção múltipla': 'seleção múltipla',
    'foto': 'foto',
    'assinatura': 'assinatura',
    'imagem': 'foto',
    'hora': 'hora',
    'data': 'data',
    // Se vier o valor "alternativo", também cobre:
    'multiple_choice': 'seleção múltipla',
    'yes_no': 'sim/não',
    'time': 'hora',
    'date': 'data',
    'photo': 'foto',
    'signature': 'assinatura',
    'text': 'texto',
    'numeric': 'numérico'
  };
  
  console.log(`[responseTypeMap] Converting database type "${dbType}" to frontend type "${typeMap[dbType] || 'texto'}"`);
  return typeMap[dbType] || 'texto'; // fallback seguro
}

// Função para normalizar tipos de resposta para o padrão interno
export function normalizeResponseType(responseType: string): "sim/não" | "texto" | "numérico" | "seleção múltipla" | "foto" | "assinatura" | "data" | "hora" {
  if (!responseType) {
    console.log('[responseTypeMap] Empty response type, defaulting to texto');
    return "texto";
  }
  
  const type = responseType.toLowerCase();
  console.log(`[responseTypeMap] Normalizing response type: "${responseType}" -> "${type}"`);
  
  if (
    type.includes("sim") || 
    type.includes("não") || 
    type.includes("nao") || 
    type.includes("yes") || 
    type.includes("no") ||
    type === "boolean" ||
    type === "yes_no"
  ) {
    return "sim/não";
  }
  
  if (
    type.includes("múltipla") || 
    type.includes("multipla") || 
    type.includes("multiple") || 
    type.includes("choice") ||
    type.includes("select") ||
    type.includes("opcoes") ||
    type.includes("opcões") ||
    type.includes("options") ||
    type === "multiple_choice"
  ) {
    return "seleção múltipla";
  }
  
  if (
    type.includes("número") || 
    type.includes("numero") || 
    type.includes("numeric") ||
    type.includes("number") ||
    type === "int" ||
    type === "integer" ||
    type === "float" ||
    type === "decimal" ||
    type === "numérico"
  ) {
    return "numérico";
  }
  
  if (
    type.includes("foto") || 
    type.includes("photo") || 
    type.includes("imagem") || 
    type.includes("image")
  ) {
    return "foto";
  }
  
  if (
    type.includes("assinatura") || 
    type.includes("signature") ||
    type.includes("sign")
  ) {
    return "assinatura";
  }
  
  if (
    type.includes("data") ||
    type.includes("date") ||
    type.includes("calendario") ||
    type.includes("calendar") ||
    type === "data"
  ) {
    return "data";
  }
  
  if (
    type.includes("hora") ||
    type.includes("time") ||
    type.includes("horário") ||
    type.includes("horario") ||
    type.includes("relógio") ||
    type.includes("relogio") ||
    type === "hora"
  ) {
    return "hora";
  }
  
  console.log(`[responseTypeMap] Type "${responseType}" normalized to "texto" (fallback)`);
  return "texto";
}
