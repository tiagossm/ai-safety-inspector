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
export enum InspectionErrorType {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  SERVER = "server",
  NETWORK = "network",
  MEDIA_UPLOAD = "media_upload",
  REPORT_GENERATION = "report_generation",
  UNKNOWN = "unknown",
}

/**
 * Classe para erros de inspeção
 */
export class InspectionError extends Error {
  type: InspectionErrorType;
  details?: any;
  originalError?: any;

  constructor(
    message: string,
    type: InspectionErrorType = InspectionErrorType.UNKNOWN,
    details?: any,
    originalError?: any
  ) {
    super(message);
    this.name = "InspectionError";
    this.type = type;
    this.details = details;
    this.originalError = originalError;
  }
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
function identifyErrorType(error: any): InspectionErrorType {
  if (!error) return InspectionErrorType.UNKNOWN;

  // Se já é um InspectionError, retorna o tipo dele
  if (error instanceof InspectionError) {
    return error.type;
  }

  // Erros do Supabase
  if (error.code) {
    const code = error.code.toString();
    
    // Códigos de erro PostgreSQL
    if (code === "23505") return InspectionErrorType.CONFLICT; // unique_violation
    if (code === "23503") return InspectionErrorType.CONFLICT; // foreign_key_violation
    if (code === "23502") return InspectionErrorType.VALIDATION; // not_null_violation
    if (code === "22P02") return InspectionErrorType.VALIDATION; // invalid_text_representation
    if (code === "42P01") return InspectionErrorType.NOT_FOUND; // undefined_table
    
    // Códigos de erro HTTP
    if (code === "401" || code === "403") return InspectionErrorType.AUTHORIZATION;
    if (code === "404") return InspectionErrorType.NOT_FOUND;
    if (code === "409") return InspectionErrorType.CONFLICT;
    if (code === "422") return InspectionErrorType.VALIDATION;
    if (code.startsWith("5")) return InspectionErrorType.SERVER;
  }

  // Erros de rede
  if (error.message && (
    error.message.includes("network") ||
    error.message.includes("connection") ||
    error.message.includes("offline")
  )) {
    return InspectionErrorType.NETWORK;
  }

  // Erros de validação
  if (error.message && (
    error.message.includes("validation") ||
    error.message.includes("required") ||
    error.message.includes("invalid")
  )) {
    return InspectionErrorType.VALIDATION;
  }

  // Erros de upload de mídia
  if (error.message && (
    error.message.includes("upload") ||
    error.message.includes("file") ||
    error.message.includes("media")
  )) {
    return InspectionErrorType.MEDIA_UPLOAD;
  }

  // Erros de geração de relatório
  if (error.message && (
    error.message.includes("report") ||
    error.message.includes("pdf") ||
    error.message.includes("excel") ||
    error.message.includes("csv")
  )) {
    return InspectionErrorType.REPORT_GENERATION;
  }

  return InspectionErrorType.UNKNOWN;
}

/**
 * Função para obter mensagem de erro amigável
 * @param error Erro original
 * @param errorType Tipo de erro
 * @returns Mensagem de erro amigável
 */
function getFriendlyErrorMessage(error: any, errorType: InspectionErrorType): string {
  // Mensagens padrão por tipo de erro
  const defaultMessages: Record<InspectionErrorType, string> = {
    [InspectionErrorType.VALIDATION]: "Dados inválidos. Verifique os campos e tente novamente.",
    [InspectionErrorType.AUTHENTICATION]: "Erro de autenticação. Faça login novamente.",
    [InspectionErrorType.AUTHORIZATION]: "Você não tem permissão para realizar esta ação.",
    [InspectionErrorType.NOT_FOUND]: "O recurso solicitado não foi encontrado.",
    [InspectionErrorType.CONFLICT]: "Conflito de dados. Este item pode já existir ou estar sendo usado.",
    [InspectionErrorType.SERVER]: "Erro no servidor. Tente novamente mais tarde.",
    [InspectionErrorType.NETWORK]: "Erro de conexão. Verifique sua internet e tente novamente.",
    [InspectionErrorType.MEDIA_UPLOAD]: "Erro ao fazer upload de mídia. Verifique o formato e tamanho do arquivo.",
    [InspectionErrorType.REPORT_GENERATION]: "Erro ao gerar relatório. Tente novamente mais tarde.",
    [InspectionErrorType.UNKNOWN]: "Ocorreu um erro inesperado. Tente novamente.",
  };

  // Tenta extrair mensagem do erro
  let errorMessage = "";
  
  if (error) {
    if (error instanceof InspectionError) {
      return error.message;
    } else if (typeof error === "string") {
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
 * @returns InspectionError padronizado
 */
export function handleInspectionError(
  error: any, 
  context: string = "", 
  showToast: boolean = true
): InspectionError {
  // Registra o erro no console
  console.error(`[Inspection][${context}] Erro:`, error);

  // Se já é um InspectionError, apenas atualiza o contexto se necessário
  if (error instanceof InspectionError) {
    if (showToast) {
      toast.error(error.message);
    }
    return error;
  }

  // Identifica o tipo de erro
  const errorType = identifyErrorType(error);
  
  // Obtém mensagem amigável
  const friendlyMessage = getFriendlyErrorMessage(error, errorType);

  // Mostra toast se necessário
  if (showToast) {
    toast.error(friendlyMessage);
  }

  // Cria e retorna um InspectionError padronizado
  return new InspectionError(
    friendlyMessage,
    errorType,
    error.details || error.hint || null,
    error
  );
}

/**
 * Função para tratamento de erros de API
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @returns InspectionError padronizado
 */
export function handleApiError(error: any, context: string = ""): InspectionError {
  return handleInspectionError(error, `API ${context}`, true);
}

/**
 * Função para tratamento de erros de validação
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @returns InspectionError padronizado
 */
export function handleValidationError(error: any, context: string = ""): InspectionError {
  return handleInspectionError(
    error, 
    `Validação ${context}`, 
    true
  );
}

/**
 * Função para tratamento de erros de upload de mídia
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @returns InspectionError padronizado
 */
export function handleMediaUploadError(error: any, context: string = ""): InspectionError {
  return handleInspectionError(
    error,
    `Upload de mídia ${context}`,
    true
  );
}

/**
 * Função para tratamento de erros de geração de relatório
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @returns InspectionError padronizado
 */
export function handleReportGenerationError(error: any, context: string = ""): InspectionError {
  return handleInspectionError(
    error,
    `Geração de relatório ${context}`,
    true
  );
}

