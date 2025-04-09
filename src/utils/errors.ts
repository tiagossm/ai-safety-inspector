
import { toast } from "sonner";

/**
 * Formats and handles API errors consistently
 */
export function handleApiError(error: any, defaultMessage = "Ocorreu um erro inesperado"): string {
  console.error("API Error:", error);
  
  let errorMessage = defaultMessage;
  
  if (error?.message) {
    errorMessage = error.message;
  }
  
  if (error?.error?.message) {
    errorMessage = error.error.message;
  }
  
  toast.error(errorMessage);
  
  return errorMessage;
}

/**
 * Extracts error message from different error formats
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error?.message) {
    return error.error.message;
  }
  
  return "Ocorreu um erro inesperado";
}
