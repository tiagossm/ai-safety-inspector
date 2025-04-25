
/**
 * Normalizes various response type formats into a standard format
 * @param responseType The original response type string
 * @returns A normalized response type string
 */
export const normalizeResponseType = (responseType: string): string => {
  if (!responseType) return "text";
  
  const type = responseType.toLowerCase();
  
  if (type.includes("sim") || type.includes("não") || type.includes("nao") || type.includes("yes") || type.includes("no")) {
    return "yes_no";
  }
  
  if (type.includes("múltipla") || type.includes("multipla") || type.includes("multiple") || type.includes("choice")) {
    return "multiple_choice";
  }
  
  if (type.includes("número") || type.includes("numero") || type.includes("numeric")) {
    return "numeric";
  }
  
  if (type.includes("texto") || type.includes("text")) {
    return "text";
  }
  
  if (type.includes("foto") || type.includes("photo") || type.includes("imagem") || type.includes("image")) {
    return "photo";
  }
  
  if (type.includes("assinatura") || type.includes("signature")) {
    return "signature";
  }
  
  return type;
};

/**
 * Determines whether a response is considered negative (e.g., "não", false, etc.)
 * @param value The response value to check
 * @returns True if the response is negative, false otherwise
 */
export const isNegativeResponse = (value: any): boolean => {
  if (value === false) return true;
  if (typeof value === "string") {
    const lowerValue = value.toLowerCase();
    return lowerValue === "não" || lowerValue === "nao" || lowerValue === "no" || lowerValue === "false";
  }
  return false;
};

/**
 * Determines whether a response is considered positive (e.g., "sim", true, etc.)
 * @param value The response value to check
 * @returns True if the response is positive, false otherwise
 */
export const isPositiveResponse = (value: any): boolean => {
  if (value === true) return true;
  if (typeof value === "string") {
    const lowerValue = value.toLowerCase();
    return lowerValue === "sim" || lowerValue === "yes" || lowerValue === "true";
  }
  return false;
};
