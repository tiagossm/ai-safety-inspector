
/**
 * Format a date string to a more readable format
 * @param dateString ISO date string to format 
 * @returns Formatted date string
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "Data desconhecida";
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    
    // Format: DD/MM/YYYY
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Erro ao formatar data";
  }
}

/**
 * Format a currency value to BRL
 * @param value Number to format as currency
 * @returns Formatted currency string
 */
export function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return "R$ 0,00";
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format a number with thousand separators
 * @param value Number to format
 * @returns Formatted number string
 */
export function formatNumber(value?: number): string {
  if (value === undefined || value === null) return "0";
  
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Format a percentage value
 * @param value Number to format as percentage
 * @param decimalPlaces Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value?: number, decimalPlaces: number = 1): string {
  if (value === undefined || value === null) return "0%";
  
  return `${value.toFixed(decimalPlaces)}%`;
}
