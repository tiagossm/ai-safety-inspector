// Padronização de tipos de resposta para garantir consistência
import { databaseToFrontendResponseType } from "./responseTypeMap";
import { debugLog } from "./debugUtils";

export interface StandardizedResponse {
  value: any;
  mediaUrls: string[];
  audioUrls?: string[];
  fileUrls?: string[];
  mediaAnalysisResults?: Record<string, any>;
  actionPlan?: string | any;
  comments?: string;
  notes?: string;
}

export interface StandardizedQuestion {
  id: string;
  pergunta: string;
  tipo_resposta: string;
  responseType?: string;
  allowsPhoto?: boolean;
  permite_foto?: boolean;
  allowsVideo?: boolean;
  permite_video?: boolean;
  allowsAudio?: boolean;
  permite_audio?: boolean;
  allowsFiles?: boolean;
  permite_files?: boolean;
  options?: string[];
  opcoes?: any;
  obrigatorio?: boolean;
  required?: boolean;
}

/**
 * Padroniza uma resposta para garantir que tenha a estrutura esperada
 */
export function standardizeResponse(response: any): StandardizedResponse {
  debugLog("standardizeResponse", "Input", response);
  
  if (!response) {
    const defaultResponse = {
      value: null,
      mediaUrls: [],
      audioUrls: [],
      fileUrls: [],
      mediaAnalysisResults: {},
      actionPlan: null,
      comments: null,
      notes: null
    };
    debugLog("standardizeResponse", "Default response (null input)", defaultResponse);
    return defaultResponse;
  }

  // Se a resposta é apenas um valor primitivo, envolve na estrutura padrão
  if (typeof response !== 'object' || response === null) {
    const primitiveResponse = {
      value: response,
      mediaUrls: [],
      audioUrls: [],
      fileUrls: [],
      mediaAnalysisResults: {},
      actionPlan: null,
      comments: null,
      notes: null
    };
    debugLog("standardizeResponse", "Primitive response", primitiveResponse);
    return primitiveResponse;
  }

  const standardizedResponse = {
    value: response.value ?? response.answer ?? null, // Suporte para 'answer' legado
    mediaUrls: Array.isArray(response.mediaUrls) ? response.mediaUrls : 
               Array.isArray(response.media_urls) ? response.media_urls : [], // Suporte para snake_case
    audioUrls: Array.isArray(response.audioUrls) ? response.audioUrls : [],
    fileUrls: Array.isArray(response.fileUrls) ? response.fileUrls : [],
    mediaAnalysisResults: response.mediaAnalysisResults || {},
    actionPlan: response.actionPlan || response.action_plan || null, // Suporte para snake_case
    comments: response.comments || null,
    notes: response.notes || null
  };
  
  debugLog("standardizeResponse", "Standardized response", standardizedResponse);
  return standardizedResponse;
}

/**
 * Padroniza uma questão para garantir que tenha as propriedades esperadas
 */
export function standardizeQuestion(question: any): StandardizedQuestion {
  if (!question) {
    throw new Error("Questão não pode ser nula");
  }

  const normalizedResponseType = databaseToFrontendResponseType(
    question.tipo_resposta || question.responseType || "sim/não"
  );

  return {
    id: question.id,
    pergunta: question.pergunta || question.text || question.question || "",
    tipo_resposta: question.tipo_resposta || "sim/não",
    responseType: normalizedResponseType,
    allowsPhoto: question.allowsPhoto || question.permite_foto || false,
    permite_foto: question.permite_foto || question.allowsPhoto || false,
    allowsVideo: question.allowsVideo || question.permite_video || false,
    permite_video: question.permite_video || question.allowsVideo || false,
    allowsAudio: question.allowsAudio || question.permite_audio || false,
    permite_audio: question.permite_audio || question.allowsAudio || false,
    allowsFiles: question.allowsFiles || question.permite_files || false,
    permite_files: question.permite_files || question.allowsFiles || false,
    options: question.options || (question.opcoes ? JSON.parse(question.opcoes) : []),
    opcoes: question.opcoes,
    obrigatorio: question.obrigatorio ?? question.required ?? true,
    required: question.required ?? question.obrigatorio ?? true
  };
}

/**
 * Verifica se uma resposta tem não conformidade baseada na análise de IA
 */
export function hasNonConformityResponse(response: StandardizedResponse): boolean {
  if (!response.mediaAnalysisResults) return false;
  
  return Object.values(response.mediaAnalysisResults).some(
    (analysis: any) => analysis?.hasNonConformity === true
  );
}

/**
 * Extrai sugestões de plano de ação de uma resposta
 */
export function extractActionPlanSuggestions(response: StandardizedResponse): string[] {
  if (!response.mediaAnalysisResults) return [];
  
  return Object.values(response.mediaAnalysisResults)
    .map((analysis: any) => analysis?.actionPlanSuggestion)
    .filter(Boolean);
}