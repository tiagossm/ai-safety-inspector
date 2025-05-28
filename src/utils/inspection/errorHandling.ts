import { toast } from "sonner";

/**
 * Tipos de erro para o módulo de inspeções
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
  OPENAI_ERROR = "openai_error",
  UNKNOWN = "unknown"
}

/**
 * Classe de erro para o módulo de inspeções
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
 * Função para tratar erros do módulo de inspeções
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @returns Erro tratado
 */
export function handleInspectionError(error: any, context?: string): InspectionError {
  console.error(`[${context || "inspection"}] Error:`, error);
  
  let errorType = InspectionErrorType.UNKNOWN;
  let errorMessage = "Ocorreu um erro desconhecido";
  let errorDetails = undefined;
  
  // Verificar se já é um InspectionError
  if (error instanceof InspectionError) {
    // Mostrar toast se não for erro de validação (que já mostra toast)
    if (error.type !== InspectionErrorType.VALIDATION) {
      toast.error(error.message);
    }
    return error;
  }
  
  // Tratar erros do Supabase
  if (error?.code) {
    switch (error.code) {
      case "PGRST116":
      case "42501":
        errorType = InspectionErrorType.AUTHORIZATION;
        errorMessage = "Você não tem permissão para realizar esta ação";
        break;
      case "42P01":
      case "PGRST301":
        errorType = InspectionErrorType.NOT_FOUND;
        errorMessage = "Recurso não encontrado";
        break;
      case "23505":
        errorType = InspectionErrorType.CONFLICT;
        errorMessage = "Conflito de dados. Este registro já existe";
        break;
      case "23503":
        errorType = InspectionErrorType.VALIDATION;
        errorMessage = "Dados inválidos ou referência inexistente";
        break;
      case "PGRST401":
      case "401":
        errorType = InspectionErrorType.AUTHENTICATION;
        errorMessage = "Autenticação necessária";
        break;
      default:
        if (error.code.startsWith("PGRST") || error.code.startsWith("42")) {
          errorType = InspectionErrorType.SERVER;
          errorMessage = "Erro no servidor de banco de dados";
        }
    }
    errorDetails = { code: error.code, details: error.details, hint: error.hint };
  } 
  // Tratar erros de rede
  else if (error instanceof TypeError && error.message.includes("fetch")) {
    errorType = InspectionErrorType.NETWORK;
    errorMessage = "Erro de conexão. Verifique sua internet";
  }
  // Tratar erros de upload de mídia
  else if (error.message && error.message.includes("upload")) {
    errorType = InspectionErrorType.MEDIA_UPLOAD;
    errorMessage = "Erro ao fazer upload do arquivo";
  }
  // Tratar erros de geração de relatório
  else if (error.message && error.message.includes("report")) {
    errorType = InspectionErrorType.REPORT_GENERATION;
    errorMessage = "Erro ao gerar relatório";
  }
  // Tratar erros da OpenAI
  else if (error.message && (
    error.message.includes("OpenAI") || 
    error.message.includes("API key") ||
    error.message.includes("assistant") ||
    error.message.includes("generate-checklist")
  )) {
    errorType = InspectionErrorType.OPENAI_ERROR;
    errorMessage = "Erro ao comunicar com a IA. Tente novamente mais tarde.";
  }
  // Usar mensagem do erro original se disponível
  else if (error.message) {
    errorMessage = error.message;
  }
  
  // Criar novo InspectionError
  const inspectionError = new InspectionError(
    errorMessage,
    errorType,
    errorDetails,
    error
  );
  
  // Mostrar toast com a mensagem de erro
  toast.error(errorMessage);
  
  return inspectionError;
}

/**
 * Função para tratar erros de validação
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @returns Erro tratado
 */
export function handleValidationError(error: any, context?: string): InspectionError {
  console.error(`[${context || "validation"}] Error:`, error);
  
  let errorMessage = "Dados inválidos";
  let errorDetails = undefined;
  
  if (error.errors && Array.isArray(error.errors)) {
    // Extrair mensagens de erro
    const messages = error.errors.map((err: any) => err.message || String(err));
    errorMessage = messages.join(". ");
    errorDetails = error.errors;
    
    // Mostrar toast para cada erro
    messages.forEach((msg: string) => toast.error(msg));
  } else if (error.message) {
    errorMessage = error.message;
    toast.error(errorMessage);
  } else {
    toast.error(errorMessage);
  }
  
  return new InspectionError(
    errorMessage,
    InspectionErrorType.VALIDATION,
    errorDetails,
    error
  );
}

/**
 * Função para tratar erros de upload de mídia
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @returns Erro tratado
 */
export function handleMediaUploadError(error: any, context?: string): InspectionError {
  console.error(`[${context || "media-upload"}] Error:`, error);
  
  let errorMessage = "Erro ao fazer upload do arquivo";
  
  if (error.message) {
    if (error.message.includes("size")) {
      errorMessage = "Arquivo muito grande";
    } else if (error.message.includes("type")) {
      errorMessage = "Tipo de arquivo não suportado";
    } else {
      errorMessage = error.message;
    }
  }
  
  toast.error(errorMessage);
  
  return new InspectionError(
    errorMessage,
    InspectionErrorType.MEDIA_UPLOAD,
    undefined,
    error
  );
}

/**
 * Função para tratar erros de geração de relatório
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @returns Erro tratado
 */
export function handleReportGenerationError(error: any, context?: string): InspectionError {
  console.error(`[${context || "report-generation"}] Error:`, error);
  
  let errorMessage = "Erro ao gerar relatório";
  
  if (error.message) {
    errorMessage = error.message;
  }
  
  toast.error(errorMessage);
  
  return new InspectionError(
    errorMessage,
    InspectionErrorType.REPORT_GENERATION,
    undefined,
    error
  );
}

/**
 * Função para tratar erros da OpenAI
 * @param error Erro a ser tratado
 * @param context Contexto onde o erro ocorreu
 * @returns Erro tratado
 */
export function handleOpenAIError(error: any, context?: string): InspectionError {
  console.error(`[${context || "openai"}] Error:`, error);
  
  let errorMessage = "Erro ao comunicar com a IA";
  let errorDetails = undefined;
  
  if (error.response?.data?.error) {
    const openAIError = error.response.data.error;
    errorMessage = openAIError.message || errorMessage;
    errorDetails = openAIError;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  // Mensagens mais amigáveis para erros comuns
  if (errorMessage.includes("API key")) {
    errorMessage = "Erro de autenticação com a OpenAI. Verifique sua chave de API.";
  } else if (errorMessage.includes("rate limit")) {
    errorMessage = "Limite de requisições excedido. Tente novamente mais tarde.";
  } else if (errorMessage.includes("assistant")) {
    errorMessage = "Erro ao comunicar com o assistente. Verifique se o assistente existe.";
  }
  
  toast.error(errorMessage);
  
  return new InspectionError(
    errorMessage,
    InspectionErrorType.OPENAI_ERROR,
    errorDetails,
    error
  );
}

