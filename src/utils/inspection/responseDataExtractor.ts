
/**
 * Utilitário para extrair dados de respostas de inspeção de forma consistente
 */

export interface ExtractedResponseData {
  value: any;
  mediaUrls: string[];
  mediaAnalysisResults: Record<string, any>;
  comment: string;
  actionPlan: any;
}

/**
 * Extrai mediaUrls de estruturas aninhadas de forma robusta
 */
export const extractMediaUrls = (response: any): string[] => {
  if (!response) return [];
  
  console.log('[responseDataExtractor] Extraindo mediaUrls de:', response);
  
  // Caminhos possíveis onde as mediaUrls podem estar
  const possiblePaths = [
    response.mediaUrls,
    response.media_urls,
    response.value?.mediaUrls,
    response.value?.media_urls,
    response.answer?.mediaUrls,
    response.answer?.media_urls,
    response.answer?.value?.mediaUrls,
    response.answer?.value?.media_urls,
  ];
  
  for (const path of possiblePaths) {
    if (Array.isArray(path) && path.length > 0) {
      console.log('[responseDataExtractor] MediaUrls encontradas:', path);
      return path.filter(url => typeof url === 'string' && url.trim() !== '');
    } else if (typeof path === 'string' && path.trim() !== '') {
      console.log('[responseDataExtractor] MediaUrl string encontrada:', path);
      return [path];
    }
  }
  
  console.log('[responseDataExtractor] Nenhuma mediaUrl encontrada');
  return [];
};

/**
 * Extrai resultados de análise de mídia
 */
export const extractMediaAnalysisResults = (response: any): Record<string, any> => {
  if (!response) return {};
  
  const possiblePaths = [
    response.mediaAnalysisResults,
    response.value?.mediaAnalysisResults,
    response.answer?.mediaAnalysisResults,
    response.answer?.value?.mediaAnalysisResults,
  ];
  
  for (const path of possiblePaths) {
    if (path && typeof path === 'object') {
      return path;
    }
  }
  
  return {};
};

/**
 * Extrai comentários/observações
 */
export const extractComments = (response: any): string => {
  if (!response) return "";
  
  const possiblePaths = [
    response.comment,
    response.comments,
    response.notes,
    response.value?.comment,
    response.value?.comments,
    response.answer?.comment,
    response.answer?.comments,
  ];
  
  for (const path of possiblePaths) {
    if (typeof path === 'string' && path.trim() !== '') {
      return path.trim();
    }
  }
  
  return "";
};

/**
 * Extrai o valor da resposta principal
 */
export const extractResponseValue = (response: any): any => {
  if (!response) return null;
  
  // Primeiro tenta extrair value direto
  if (response.value !== undefined) {
    return response.value;
  }
  
  // Depois tenta answer.value
  if (response.answer?.value !== undefined) {
    return response.answer.value;
  }
  
  // Caso especial: se answer é string/boolean/number, usa direto
  if (response.answer !== undefined && 
      (typeof response.answer === 'string' || 
       typeof response.answer === 'boolean' || 
       typeof response.answer === 'number')) {
    return response.answer;
  }
  
  return null;
};

/**
 * Extrai plano de ação
 */
export const extractActionPlan = (response: any): any => {
  if (!response) return null;
  
  const possiblePaths = [
    response.actionPlan,
    response.action_plan,
    response.value?.actionPlan,
    response.answer?.actionPlan,
  ];
  
  for (const path of possiblePaths) {
    if (path) {
      return path;
    }
  }
  
  return null;
};

/**
 * Extrai todos os dados de resposta de forma unificada
 */
export const extractResponseData = (response: any): ExtractedResponseData => {
  return {
    value: extractResponseValue(response),
    mediaUrls: extractMediaUrls(response),
    mediaAnalysisResults: extractMediaAnalysisResults(response),
    comment: extractComments(response),
    actionPlan: extractActionPlan(response),
  };
};
