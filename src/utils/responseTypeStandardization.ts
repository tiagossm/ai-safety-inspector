// Padronização de tipos de resposta para garantir consistência
import { databaseToFrontendResponseType } from "./responseTypeMap";

export interface StandardizedResponse {
  value: any;
  mediaUrls: string[];
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
  if (!response) {
    return {
      value: null,
      mediaUrls: [],
      mediaAnalysisResults: {},
      actionPlan: null,
      comments: null,
      notes: null
    };
  }

  // Se a resposta é apenas um valor primitivo, envolve na estrutura padrão
  if (typeof response !== 'object' || response === null) {
    return {
      value: response,
      mediaUrls: [],
      mediaAnalysisResults: {},
      actionPlan: null,
      comments: null,
      notes: null
    };
  }

  return {
    value: response.value ?? null,
    mediaUrls: Array.isArray(response.mediaUrls) ? response.mediaUrls : [],
    mediaAnalysisResults: response.mediaAnalysisResults || {},
    actionPlan: response.actionPlan || null,
    comments: response.comments || null,
    notes: response.notes || null
  };
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