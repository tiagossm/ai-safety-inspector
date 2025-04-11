
import { format, isValid, parseISO, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formats a date string to a localized format
 */
export function formatDate(dateString: string, formatString: string = "dd MMM yyyy"): string {
  if (!dateString) return "";
  
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      return "Data inválida";
    }
    
    return format(date, formatString, { locale: ptBR });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Data inválida";
  }
}

/**
 * Formats a date string to a relative format (e.g., "há 3 dias")
 */
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      return "Data inválida";
    }
    
    return formatDistance(date, new Date(), { 
      locale: ptBR,
      addSuffix: true 
    });
  } catch (error) {
    console.error("Error formatting relative date:", error);
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
 * Formats a number as currency (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Truncates text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('pt-BR').format(number);
}

/**
 * Formats a string to capitalize the first letter of each word
 */
export function capitalizeWords(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats a CNPJ string (e.g., "12345678000199" -> "12.345.678/0001-99")
 */
export function formatCNPJ(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj;
  
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}
