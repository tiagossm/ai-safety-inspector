/**
 * Normaliza o tipo de resposta para um formato consistente
 * @param responseType Tipo de resposta a ser normalizado
 * @returns Tipo de resposta normalizado
 */
export function normalizeResponseType(responseType: string): string {
  if (!responseType) return "yes_no";
  
  const type = responseType.toLowerCase().trim();
  
  // Mapeamento de tipos de resposta
  const typeMap: Record<string, string> = {
    // Tipos sim/não
    "sim/não": "yes_no",
    "sim/nao": "yes_no",
    "yes/no": "yes_no",
    "yes_no": "yes_no",
    "boolean": "yes_no",
    "booleano": "yes_no",
    
    // Tipos múltipla escolha
    "múltipla escolha": "multiple_choice",
    "multipla escolha": "multiple_choice",
    "multiple choice": "multiple_choice",
    "multiple_choice": "multiple_choice",
    "choice": "multiple_choice",
    "escolha": "multiple_choice",
    "select": "multiple_choice",
    "options": "multiple_choice",
    "opções": "multiple_choice",
    "opcoes": "multiple_choice",
    
    // Tipos texto
    "texto": "text",
    "text": "text",
    "string": "text",
    "textarea": "text",
    "área de texto": "text",
    "area de texto": "text",
    
    // Tipos numéricos
    "número": "numeric",
    "numero": "numeric",
    "number": "numeric",
    "numeric": "numeric",
    "numérico": "numeric",
    "numerico": "numeric",
    
    // Tipos foto
    "foto": "photo",
    "photo": "photo",
    "imagem": "photo",
    "image": "photo",
    "picture": "photo",
    
    // Tipos assinatura
    "assinatura": "signature",
    "signature": "signature",
    "sign": "signature",
    "assinar": "signature"
  };
  
  // Retorna o tipo normalizado ou o padrão (yes_no)
  return typeMap[type] || "yes_no";
}

