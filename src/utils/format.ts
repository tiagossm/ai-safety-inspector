
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formats a date string to a localized format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      return "Data inválida";
    }
    
    return format(date, "dd MMM yyyy", { locale: ptBR });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Data inválida";
  }
}

/**
 * Formats a number as a percentage
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Truncates text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
