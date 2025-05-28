import { toast } from "sonner";

/**
 * Interface para erros do Supabase
 */
interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

/**
 * Tipos de erros conhecidos
 */
export enum ErrorType {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  SERVER = "server",
  NETWORK = "network",
  UNKNOWN = "unknown",
}

/**
 * Função para validar campos obrigatórios
 * @param fields Objeto com campos a serem validados
 * @returns true se todos os campos são válidos, false caso contrário
 */
export function validateRequiredFields(fields: Record<string, any>): boolean {
  const missingFields: string[] = [];

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      missingFields.push(key);
    }
  });

  if (missingFields.length > 0) {
    const fieldList = missingFields.join(", ");
    toast.error(`Campos obrigatórios não preenchidos: ${fieldList}`);
    return false;
  }

  return true;
}

/**
 * Função para identificar o tipo de erro
 * @param error Erro a ser identificado
 * @returns Tipo de erro
 */
function identifyErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  // Erros do Supabase
  if (error.code) {
    const code = error.code.toString();
    
    // Códigos de erro PostgreSQL
    if (code === "23505") return ErrorType.CONFLICT; // unique_violation
    if (code === "23503") return ErrorType.CONFLICT; // foreign_key_violation
    if (code === "23502") return ErrorType.VALIDATION; // not_null_violation
    if (code === "22P02") return ErrorType.VALIDATION; // invalid_text_representation
    if (code === "42P01") return ErrorType.NOT_FOUND; // undefined_table
    
    // Códigos de erro HTTP
    if (code === "401" || code === "403") return ErrorType.AUTHORIZATION;
    if (code === "404") return ErrorType.NOT_FOUND;
    if (code === "409") return ErrorType.CONFLICT;
    if (code === "422") return ErrorType.VALIDATION;
    if (code.startsWith("5")) return ErrorType.SERVER;
  }

  // Erros de rede
  if (error.message && (
    error.message.includes("network") ||
    error.message.includes("connection") ||
    error.message.includes("offline")
  )) {
    return ErrorType.NETWORK;
  }

  // Erros de validação
  if (error.message && (
    error.message.includes("validation") ||
    error.message.includes("required") ||
    error.message.includes("invalid")
  )) {
    return ErrorType.VALIDATION;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Função para obter mensagem de erro amigável
 * @param error Erro original
 * @param errorType Tipo de erro
 * @returns Mensagem de erro amigável
 */
function getFriendlyErrorMessage(error: any, errorType: ErrorType): string {
  // Mensagens padrão por tipo de erro
  const defaultMessages: Record<ErrorType, string> = {
    [ErrorType.VALIDATION]: "Dados inválidos. Verifique os campos e tente novamente.",
    [ErrorType.AUTHENTICATION]: "Erro de autenticação. Faça login novamente.",
    [ErrorType.AUTHORIZATION]: "Você não tem permissão para realizar esta ação.",
    [ErrorType.NOT_FOUND]: "O recurso solicitado não foi encontrado.",
    [ErrorType.CONFLICT]: "Conflito de dados. Este item pode já existir ou estar sendo usado.",
    [ErrorType.SERVER]: "Erro no servidor. Tente novamente mais tarde.",
    [ErrorType.NETWORK]: "Erro de conexão. Verifique sua internet e tente novamente.",
    [ErrorType.UNKNOWN]: "Ocorreu um erro inesperado. Tente novamente.",
  };

  // Tenta extrair mensagem do erro
  let errorMessage = "";
  
  if (error) {
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.details) {
      errorMessage = error.details;
    }
  }

  // Se tiver uma mensagem específica, usa ela, senão usa a mensagem padrão
  return errorMessage || defaultMessages[errorType];
}

/**
 * Função principal para tratamento de erros
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @param showToast Se deve mostrar toast com mensagem de erro
 */
export function handleError(error: any, context: string = "", showToast: boolean = true): void {
  // Registra o erro no console
  console.error(`[${context}] Erro:`, error);

  // Identifica o tipo de erro
  const errorType = identifyErrorType(error);
  
  // Obtém mensagem amigável
  const friendlyMessage = getFriendlyErrorMessage(error, errorType);

  // Mostra toast se necessário
  if (showToast) {
    toast.error(friendlyMessage);
  }

  // Registra erro no sistema de monitoramento (se existir)
  // TODO: Implementar integração com sistema de monitoramento
}

/**
 * Função para tratamento de erros de API
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 */
export function handleApiError(error: any, context: string = ""): void {
  handleError(error, `API ${context}`, true);
}

/**
 * Função para tratamento de erros de validação
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 */
export function handleValidationError(error: any, context: string = ""): void {
  handleError(error, `Validação ${context}`, true);
}

