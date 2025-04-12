
import { toast } from "sonner";

/**
 * Formats and handles API errors consistently
 */
export function handleApiError(error: any, defaultMessage = "Ocorreu um erro inesperado"): string {
  console.error("API Error:", error);
  
  // Get error details
  const errorInfo = {
    message: getErrorMessage(error),
    code: error?.code || 'unknown',
    status: error?.status || null,
    timestamp: new Date().toISOString(),
  };
  
  console.error("Error details:", errorInfo);
  
  // Show toast with error message
  toast.error(errorInfo.message);
  
  return errorInfo.message;
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
  
  // Check for Supabase specific error formats
  if (error?.error?.details) {
    return error.error.details;
  }
  
  return "Ocorreu um erro inesperado";
}
