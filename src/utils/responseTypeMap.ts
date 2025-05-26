// src/utils/responseTypeMap.ts
// Este arquivo mapeia os tipos de resposta entre o frontend e o banco de dados
// Cobertura total para todos os valores aceitos pela constraint do banco

export function frontendToDatabaseResponseType(frontendType: string): string {
  // O frontend já usa os valores em inglês, então retornamos direto
  return frontendType;
}

export function databaseToFrontendResponseType(dbType: string): string {
  // O banco também usa os mesmos valores, então retornamos direto
  return dbType;
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
