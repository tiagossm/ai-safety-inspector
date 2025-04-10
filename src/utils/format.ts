
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formats a date string to a localized format
 * 
 * @param dateStr Date string to format
 * @param formatStr Optional format string (defaults to dd/MM/yyyy)
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (dateStr: string, formatStr: string = 'dd/MM/yyyy'): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  
  if (!isValid(date)) return '';
  
  return format(date, formatStr, { locale: ptBR });
};

/**
 * Formats currency values to BRL format
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Truncates text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
