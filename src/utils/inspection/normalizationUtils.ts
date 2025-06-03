/**
 * Normaliza o tipo de resposta para os permitidos pelo banco
 * Aceitos: 'sim/não', 'numérico', 'texto', 'foto', 'assinatura', 'seleção múltipla',
 *          'yes_no', 'numeric', 'text', 'photo', 'signature', 'multiple_choice',
 *          'date', 'time'
 */
const DB_RESPONSE_TYPES = [
  "sim/não", "numérico", "texto", "foto", "assinatura", "seleção múltipla",
  "yes_no", "numeric", "text", "photo", "signature", "multiple_choice",
  "date", "time"
];

export const normalizeResponseType = (
  responseType: string
): "yes_no" | "multiple_choice" | "numeric" | "photo" | "signature" | "date" | "time" | "text" => {
  if (!responseType) return "text";
  const type = responseType.toLowerCase().trim();

  if (
    type === "sim/não" || type === "sim/nao" || type === "yes_no" ||
    type === "boolean" || type === "yes/no" || type === "yes" || type === "no"
  ) return "yes_no";
  
  if (
    type === "seleção múltipla" || type === "selecao multipla" ||
    type === "multiple_choice" || type === "múltipla escolha" ||
    type === "multipla escolha" || type === "choice" || type === "checkbox" ||
    type === "checkboxes"
  ) return "multiple_choice";
  
  if (
    type === "numérico" || type === "numerico" || type === "numeric" ||
    type === "number" || type === "int" || type === "integer" ||
    type === "float" || type === "decimal"
  ) return "numeric";
  
  if (
    type === "foto" || type === "photo" || type === "image" || type === "imagem"
  ) return "photo";
  
  if (
    type === "assinatura" || type === "signature" || type === "sign"
  ) return "signature";
  
  if (type === "date" || type === "data") return "date";
  if (type === "time" || type === "hora" || type === "horario" || type === "horário") return "time";
  if (type === "texto" || type === "text" || type === "string" || type === "paragraph" || type === "parágrafo") return "text";

  // fallback se o dev colocar exatamente o permitido
  if (DB_RESPONSE_TYPES.includes(type)) return type as any;

  // DEFAULT
  return "text";
};

/**
 * Determina se uma resposta é negativa (usado para planos de ação)
 */
export const isNegativeResponse = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === "boolean") return value === false;
  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase().trim();
    return (
      normalizedValue === "false" ||
      normalizedValue === "não" ||
      normalizedValue === "nao" ||
      normalizedValue === "no" ||
      normalizedValue === "0"
    );
  }
  if (typeof value === "number") return value === 0;
  return false;
};

export const normalizeAIResponseType = normalizeResponseType;
