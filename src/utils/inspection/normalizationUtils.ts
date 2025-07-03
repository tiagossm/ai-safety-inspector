
/**
 * Normalizes various input response types to a consistent set of values
 * This helps handle different response type formats across the application
 */
export const normalizeResponseType = (responseType: string): "text" | "yes_no" | "multiple_choice" | "numeric" | "photo" | "signature" | "date" | "time" => {
  if (!responseType) return "text";
  
  const type = responseType.toLowerCase();
  
  if (
    type.includes("sim") || 
    type.includes("não") || 
    type.includes("nao") || 
    type.includes("yes") || 
    type.includes("no") ||
    type === "boolean"
  ) {
    return "yes_no";
  }
  
  if (
    type.includes("múltipla") || 
    type.includes("multipla") || 
    type.includes("multiple") || 
    type.includes("choice") ||
    type.includes("select") ||
    type.includes("opcoes") ||
    type.includes("opcões") ||
    type.includes("options")
  ) {
    return "multiple_choice";
  }
  
  if (
    type.includes("número") || 
    type.includes("numero") || 
    type.includes("numeric") ||
    type.includes("number") ||
    type === "int" ||
    type === "integer" ||
    type === "float" ||
    type === "decimal"
  ) {
    return "numeric";
  }
  
  if (
    type.includes("foto") || 
    type.includes("photo") || 
    type.includes("imagem") || 
    type.includes("image")
  ) {
    return "photo";
  }
  
  if (
    type.includes("assinatura") || 
    type.includes("signature") ||
    type.includes("sign")
  ) {
    return "signature";
  }
  
  if (
    type.includes("data") ||
    type.includes("date") ||
    type.includes("calendario") ||
    type.includes("calendar")
  ) {
    return "date";
  }
  
  if (
    type.includes("hora") ||
    type.includes("time") ||
    type.includes("horário") ||
    type.includes("horario") ||
    type.includes("relógio") ||
    type.includes("relogio")
  ) {
    return "time";
  }
  
  return "text"; // Default to text if no match is found
};

/**
 * Determines if a response value is a "negative" response
 * This is used for showing action plans on negative responses
 */
export const isNegativeResponse = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  
  if (typeof value === "boolean") return value === false;
  
  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase().trim();
    return normalizedValue === "false" ||
           normalizedValue === "não" ||
           normalizedValue === "nao" ||
           normalizedValue === "no" ||
           normalizedValue === "0";
  }
  
  if (typeof value === "number") return value === 0;
  
  return false;
};
