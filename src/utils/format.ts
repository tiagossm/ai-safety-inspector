
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formats a date string to a localized format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  
  try {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    console.error("Error parsing date:", error);
    return dateString;
  }
};

/**
 * Formats a date string to a localized format with time
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return "-";
  
  try {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error("Error parsing date:", error);
    return dateString;
  }
};

/**
 * Formats a number as a percentage
 */
export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

/**
 * Truncates a string if it exceeds the maximum length
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};
