
import { toast } from "sonner";

/**
 * Função utilitária para tratamento de erros de forma padronizada
 */
export function handleError(error: any, message: string = "Ocorreu um erro inesperado"): void {
  console.error(message, error);
  
  // Extrair mensagem de erro de diferentes formatos
  let errorMessage = message;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error?.message) {
    errorMessage = error.error.message;
  } else if (error?.error?.details) {
    errorMessage = error.error.details;
  }
  
  // Exibir toast com mensagem de erro
  toast.error(errorMessage);
}

/**
 * Função para validar campos obrigatórios
 * @returns true se todos os campos forem válidos, false caso contrário
 */
export function validateRequiredFields(fields: Record<string, any>): boolean {
  const invalidFields: string[] = [];
  
  for (const [key, value] of Object.entries(fields)) {
    // Considerar string vazia ou null/undefined como inválido
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      invalidFields.push(key);
    }
  }
  
  if (invalidFields.length > 0) {
    toast.error(`Preencha os campos obrigatórios: ${invalidFields.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Função com wrapper try/catch para executar operações com tratamento de erro padronizado
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  onSuccess?: (result: T) => void,
  errorMessage: string = "Ocorreu um erro na operação"
): Promise<T | null> {
  try {
    const result = await operation();
    if (onSuccess) onSuccess(result);
    return result;
  } catch (error) {
    handleError(error, errorMessage);
    return null;
  }
}
