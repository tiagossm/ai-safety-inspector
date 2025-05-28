/**
 * Mapeia tipos de resposta entre diferentes formatos
 * @param type Tipo de resposta a ser mapeado
 * @param direction Direção do mapeamento (toDb ou toFrontend)
 * @returns Tipo de resposta mapeado
 */
export function mapResponseType(type: string, direction: "toDb" | "toFrontend" = "toFrontend"): string {
  if (!type) return direction === "toDb" ? "sim/não" : "yes_no";
  
  // Mapeamento de tipos do frontend para o banco de dados
  const frontendToDb: Record<string, string> = {
    "yes_no": "sim/não",
    "multiple_choice": "múltipla escolha",
    "text": "texto",
    "numeric": "número",
    "photo": "foto",
    "signature": "assinatura"
  };
  
  // Mapeamento de tipos do banco de dados para o frontend
  const dbToFrontend: Record<string, string> = {
    "sim/não": "yes_no",
    "múltipla escolha": "multiple_choice",
    "multipla escolha": "multiple_choice",
    "texto": "text",
    "número": "numeric",
    "numero": "numeric",
    "foto": "photo",
    "assinatura": "signature"
  };
  
  // Seleciona o mapeamento correto com base na direção
  const mapping = direction === "toDb" ? frontendToDb : dbToFrontend;
  
  // Retorna o tipo mapeado ou o original se não houver mapeamento
  return mapping[type] || type;
}

