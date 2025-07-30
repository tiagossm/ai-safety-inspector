import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface MediaAnalysisResult {
  analysis?: string;
  type?: string;
  analysisType?: string;
  suggestion?: string;
  isConform?: boolean;
  actionPlan?: any;
  actionPlanSuggestion?: string;
  hasNonConformity?: boolean;
  psychosocialRiskDetected?: boolean;
  questionText?: string;
  userAnswer?: string;
  confidence?: number;
  rawData?: any;
}

export interface MediaAnalysisOptions {
  mediaUrl: string;
  questionText: string;
  userAnswer?: string;
  multimodalAnalysis?: boolean;
  additionalMediaUrls?: string[];
  mediaType?: string;
}

export function useMediaAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [requestQueue, setRequestQueue] = useState<Set<string>>(new Set());
  const [failedRequests, setFailedRequests] = useState<Set<string>>(new Set());
  const [abortControllers, setAbortControllers] = useState<Map<string, AbortController>>(new Map());

  // Timeout mais agressivo (30 segundos)
  const REQUEST_TIMEOUT = 30000;
  const MAX_RETRIES = 2;

  const generateRequestKey = useCallback((mediaUrl: string, questionText: string, userAnswer?: string) => {
    return `${mediaUrl}|${questionText}|${userAnswer || ''}`;
  }, []);

  const logAnalysisAttempt = useCallback((requestKey: string, attempt: number, action: string) => {
    console.log(`🔍 [MediaAnalysis] ${action}:`, {
      requestKey: requestKey.substring(0, 50) + '...',
      attempt,
      timestamp: new Date().toISOString(),
      queueSize: requestQueue.size,
      analyzing
    });
  }, [requestQueue.size, analyzing]);

  const analyze = useCallback(async (options: MediaAnalysisOptions & { forceRetry?: boolean }): Promise<MediaAnalysisResult | null> => {
    const { mediaUrl, questionText, userAnswer, forceRetry = false } = options;
    const requestKey = generateRequestKey(mediaUrl, questionText, userAnswer);

    if (!mediaUrl) {
      toast.error("URL de mídia inválida para análise");
      return null;
    }

    // Se forceRetry for true, limpa o cache de falhas
    if (forceRetry) {
      setFailedRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
      logAnalysisAttempt(requestKey, 1, 'FORCE_RETRY_INITIATED');
    }

    // Verifica se já está na fila ou falhou anteriormente (exceto se forceRetry)
    if (!forceRetry && (requestQueue.has(requestKey) || failedRequests.has(requestKey))) {
      logAnalysisAttempt(requestKey, 0, requestQueue.has(requestKey) ? 'SKIPPED_IN_QUEUE' : 'SKIPPED_FAILED');
      return null;
    }

    // Cancela requisição anterior se existir
    const existingController = abortControllers.get(requestKey);
    if (existingController) {
      existingController.abort();
      logAnalysisAttempt(requestKey, 0, 'CANCELLED_PREVIOUS');
    }

    // Criar novo AbortController
    const abortController = new AbortController();
    setAbortControllers(prev => new Map(prev).set(requestKey, abortController));
    
    // Adicionar à fila
    setRequestQueue(prev => new Set(prev).add(requestKey));
    setAnalyzing(true);

    try {
      logAnalysisAttempt(requestKey, 1, 'STARTING_ANALYSIS');

      const mediaType = getMediaType(mediaUrl);
      
      // Timeout Promise
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Timeout: Análise não completada em ${REQUEST_TIMEOUT / 1000} segundos`));
        }, REQUEST_TIMEOUT);
        
        // Limpar timeout se a requisição for cancelada
        abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Análise cancelada pelo usuário'));
        });
      });

      // Análise Promise
      const analysisPromise = supabase.functions.invoke('analyze-media', {
        body: {
          mediaUrl,
          questionText,
          userAnswer,
          mediaType,
          timestamp: Date.now()
        }
      });

      // Race entre timeout e análise
      const response = await Promise.race([analysisPromise, timeoutPromise]) as any;

      logAnalysisAttempt(requestKey, 1, 'ANALYSIS_RESPONSE_RECEIVED');

      if (response.error) {
        throw new Error(response.error.message || 'Erro na análise de mídia');
      }

      if (!response.data) {
        throw new Error('Resposta vazia do servidor');
      }

      // Processar resultado com compatibilidade completa
      const hasNonConformity = hasNonConformityIndicators(response.data.comment);
      const actionPlanFormatted = formatActionPlan(response.data.actionPlan);
      
      const result: MediaAnalysisResult = {
        analysis: response.data.comment || 'Nenhuma análise disponível',
        type: getMediaType(mediaUrl),
        analysisType: 'conformity_check',
        suggestion: response.data.comment || 'Nenhuma sugestão disponível',
        isConform: !hasNonConformity,
        actionPlan: actionPlanFormatted,
        actionPlanSuggestion: actionPlanFormatted ? 'Plano de ação sugerido' : undefined,
        hasNonConformity,
        psychosocialRiskDetected: false, // TODO: implementar detecção
        confidence: 0.8,
        rawData: response.data,
        questionText,
        userAnswer
      };

      logAnalysisAttempt(requestKey, 1, 'ANALYSIS_COMPLETED_SUCCESS');
      return result;

    } catch (error: any) {
      logAnalysisAttempt(requestKey, 1, `ANALYSIS_FAILED: ${error.message}`);
      
      // Adicionar à lista de falhas
      setFailedRequests(prev => new Set(prev).add(requestKey));
      
      // Mensagens de erro específicas
      if (error.message?.includes('Timeout')) {
        toast.error("Análise expirou. Verifique sua conexão e tente novamente.");
      } else if (error.message?.includes('Rate limit')) {
        toast.error("Muitas análises simultâneas. Aguarde alguns segundos.");
      } else if (error.message?.includes('cancelada')) {
        toast.info("Análise cancelada.");
      } else {
        toast.error(`Erro na análise: ${error.message || "Erro desconhecido"}`);
      }
      
      return null;

    } finally {
      // Cleanup
      setRequestQueue(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
      
      setAbortControllers(prev => {
        const newMap = new Map(prev);
        newMap.delete(requestKey);
        return newMap;
      });
      
      setAnalyzing(prev => prev && requestQueue.size > 1);
    }
  }, [generateRequestKey, logAnalysisAttempt, requestQueue, failedRequests, abortControllers]);

  const hasNonConformityIndicators = useCallback((comment: string) => {
    if (!comment) return false;
    
    const nonConformityKeywords = [
      'não conforme', 'não está em conformidade', 'irregular',
      'incorreto', 'problema', 'erro', 'falha', 'inadequado',
      'insuficiente', 'deficiente', 'precário'
    ];
    
    return nonConformityKeywords.some(keyword => 
      comment.toLowerCase().includes(keyword)
    );
  }, []);

  const formatActionPlan = useCallback((actionPlan: any) => {
    if (!actionPlan || !hasActionPlanContent(actionPlan)) {
      return null;
    }

    return {
      what: actionPlan.what || '',
      why: actionPlan.why || '',
      who: actionPlan.who || '',
      when: actionPlan.when || '',
      where: actionPlan.where || '',
      how: actionPlan.how || '',
      howMuch: actionPlan.howMuch || actionPlan.how_much || ''
    };
  }, []);

  const hasActionPlanContent = useCallback((actionPlan: any) => {
    if (!actionPlan || typeof actionPlan !== 'object') return false;
    
    const fields = ['what', 'why', 'who', 'when', 'where', 'how', 'howMuch', 'how_much'];
    return fields.some(field => 
      actionPlan[field] && 
      actionPlan[field].trim() !== '' && 
      actionPlan[field].toLowerCase() !== 'nenhuma ação sugerida'
    );
  }, []);

  const getMediaType = useCallback((url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return 'video';
    } else if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension || '')) {
      return 'audio';
    } else {
      return 'document';
    }
  }, []);

  const canRetry = useCallback((mediaUrl: string, questionText: string, userAnswer?: string) => {
    const requestKey = generateRequestKey(mediaUrl, questionText, userAnswer);
    return failedRequests.has(requestKey);
  }, [generateRequestKey, failedRequests]);

  const retryAnalysis = useCallback(async (options: MediaAnalysisOptions): Promise<MediaAnalysisResult | null> => {
    return analyze({ ...options, forceRetry: true });
  }, [analyze]);

  const cancelAllAnalysis = useCallback(() => {
    logAnalysisAttempt('ALL', 0, 'CANCEL_ALL_REQUESTED');
    
    // Cancelar todas as requisições ativas
    abortControllers.forEach((controller, key) => {
      controller.abort();
      logAnalysisAttempt(key, 0, 'CANCELLED_BY_USER');
    });
    
    // Limpar estado
    setAbortControllers(new Map());
    setRequestQueue(new Set());
    setAnalyzing(false);
  }, [abortControllers, logAnalysisAttempt]);

  const getAnalysisStatus = useCallback(() => {
    return {
      analyzing,
      queueSize: requestQueue.size,
      failedCount: failedRequests.size,
      hasFailures: failedRequests.size > 0
    };
  }, [analyzing, requestQueue.size, failedRequests.size]);

  return {
    analyze,
    analyzing,
    canRetry,
    retryAnalysis,
    cancelAllAnalysis,
    getAnalysisStatus
  };
}