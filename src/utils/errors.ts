
/**
 * Extracts a readable error message from different types of errors
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
 */
export function handleApiError(error: unknown): string {
  const message = getErrorMessage(error);
  console.error('API error:', error);
  return message;
}
