
/**
 * Extrai uma mensagem de erro legível a partir de diferentes tipos de erros
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Handle Supabase errors
    if ('message' in error) {
      return String(error.message);
    }
    
    if ('error' in error && typeof error.error === 'object' && error.error !== null) {
      if ('message' in error.error) {
        return String(error.error.message);
      }
    }
    
    // Try to convert to JSON string
    try {
      return JSON.stringify(error);
    } catch (e) {
      // If we can't stringify, return generic error
      return 'Ocorreu um erro desconhecido';
    }
  }
  
  return 'Ocorreu um erro desconhecido';
}

/**
 * Handles API errors in a standardized way
 * @param error The error object
 * @param defaultMessage Optional default message to show instead of the technical error
 * @returns Formatted error message
 */
export function handleApiError(error: unknown, defaultMessage?: string): string {
  const message = defaultMessage || getErrorMessage(error);
  console.error('API error:', error);
  return message;
}
