import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

// Circuit Breaker para controlar falhas consecutivas
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

// Estado detalhado de análise
interface AnalysisState {
  analyzing: boolean;
  requestQueue: Set<string>;
  failedRequests: Set<string>;
  abortControllers: Map<string, AbortController>;
  circuitBreaker: CircuitBreakerState;
  lastHeartbeat: number;
  activeRequests: Map<string, { startTime: number; attempt: number; }>;
}

export function useMediaAnalysis() {
  // Estado principal atomico
  const [state, setState] = useState<AnalysisState>({
    analyzing: false,
    requestQueue: new Set(),
    failedRequests: new Set(),
    abortControllers: new Map(),
    circuitBreaker: { failures: 0, lastFailure: 0, state: 'CLOSED' },
    lastHeartbeat: Date.now(),
    activeRequests: new Map()
  });
  
  // Refs para monitoramento
  const stateRef = useRef(state);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  
  // Configurações
  const REQUEST_TIMEOUT = 35000; // 35 segundos
  const CIRCUIT_BREAKER_THRESHOLD = 3;
  const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minuto
  const WATCHDOG_INTERVAL = 15000; // 15 segundos
  const MAX_QUEUE_SIZE = 5;

  // Atualizar ref quando estado muda
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Função de atualização atômica do estado
  const updateState = useCallback((updater: (prev: AnalysisState) => AnalysisState) => {
    setState(prev => {
      const newState = updater(prev);
      // Log para debugging
      if (newState.analyzing !== prev.analyzing || newState.requestQueue.size !== prev.requestQueue.size) {
        console.log('🔄 [MediaAnalysis] Estado atualizado:', {
          analyzing: newState.analyzing,
          queueSize: newState.requestQueue.size,
          activeRequests: newState.activeRequests.size,
          circuitState: newState.circuitBreaker.state,
          timestamp: new Date().toISOString()
        });
      }
      return newState;
    });
  }, []);

  // Circuit Breaker Logic
  const isCircuitOpen = useCallback(() => {
    const cb = stateRef.current.circuitBreaker;
    if (cb.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - cb.lastFailure;
      if (timeSinceLastFailure > CIRCUIT_BREAKER_TIMEOUT) {
        updateState(prev => ({
          ...prev,
          circuitBreaker: { ...prev.circuitBreaker, state: 'HALF_OPEN' }
        }));
        return false;
      }
      return true;
    }
    return false;
  }, [updateState]);

  const recordFailure = useCallback(() => {
    updateState(prev => {
      const newFailures = prev.circuitBreaker.failures + 1;
      const newState = newFailures >= CIRCUIT_BREAKER_THRESHOLD ? 'OPEN' : 'CLOSED';
      
      return {
        ...prev,
        circuitBreaker: {
          failures: newFailures,
          lastFailure: Date.now(),
          state: newState as 'CLOSED' | 'OPEN' | 'HALF_OPEN'
        }
      };
    });
  }, [updateState]);

  const recordSuccess = useCallback(() => {
    updateState(prev => ({
      ...prev,
      circuitBreaker: { failures: 0, lastFailure: 0, state: 'CLOSED' }
    }));
  }, [updateState]);

  // Watchdog Timer para detectar requisições travadas
  const startWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
    }

    watchdogRef.current = setInterval(() => {
      const now = Date.now();
      const currentState = stateRef.current;

      // Verificar requisições travadas
      const stuckRequests = Array.from(currentState.activeRequests.entries()).filter(
        ([, info]) => now - info.startTime > REQUEST_TIMEOUT + 5000
      );

      if (stuckRequests.length > 0) {
        console.warn('🚨 [MediaAnalysis] Requisições travadas detectadas:', stuckRequests.map(([key]) => key));
        
        updateState(prev => {
          const newActiveRequests = new Map(prev.activeRequests);
          const newQueue = new Set(prev.requestQueue);
          const newControllers = new Map(prev.abortControllers);

          stuckRequests.forEach(([key]) => {
            newActiveRequests.delete(key);
            newQueue.delete(key);
            const controller = newControllers.get(key);
            if (controller) {
              controller.abort();
              newControllers.delete(key);
            }
          });

          return {
            ...prev,
            activeRequests: newActiveRequests,
            requestQueue: newQueue,
            abortControllers: newControllers,
            analyzing: newQueue.size > 0
          };
        });

        toast({ title: "Análises Travadas", description: "Algumas análises travaram e foram canceladas automaticamente.", variant: "destructive" });
      }

      // Verificar se precisa limpar estado órfão
      if (currentState.analyzing && currentState.requestQueue.size === 0 && currentState.activeRequests.size === 0) {
        console.warn('🔧 [MediaAnalysis] Estado órfão detectado - limpando');
        updateState(prev => ({ ...prev, analyzing: false }));
      }

    }, WATCHDOG_INTERVAL);
  }, [updateState]);

  const stopWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  // Iniciar watchdog quando análise começa
  useEffect(() => {
    if (state.analyzing) {
      startWatchdog();
    } else {
      stopWatchdog();
    }

    return () => stopWatchdog();
  }, [state.analyzing, startWatchdog, stopWatchdog]);

  const generateRequestKey = useCallback((mediaUrl: string, questionText: string, userAnswer?: string) => {
    return `${mediaUrl}|${questionText}|${userAnswer || ''}`;
  }, []);

  const analyze = useCallback(async (options: MediaAnalysisOptions & { forceRetry?: boolean }): Promise<MediaAnalysisResult | null> => {
    const { mediaUrl, questionText, userAnswer, forceRetry = false } = options;
    const requestKey = generateRequestKey(mediaUrl, questionText, userAnswer);

    if (!mediaUrl) {
      toast({ title: "Erro", description: "URL de mídia inválida para análise", variant: "destructive" });
      return null;
    }

    // Verificar circuit breaker
    if (!forceRetry && isCircuitOpen()) {
      toast({ 
        title: "Análise temporariamente indisponível", 
        description: "Muitas falhas recentes. Tente novamente em alguns minutos.", 
        variant: "destructive" 
      });
      return null;
    }

    // Verificar limite da fila
    if (state.requestQueue.size >= MAX_QUEUE_SIZE) {
      toast({ 
        title: "Fila cheia", 
        description: "Muitas análises em andamento. Aguarde a conclusão.", 
        variant: "destructive" 
      });
      return null;
    }

    // Se forceRetry for true, limpa o cache de falhas
    if (forceRetry) {
      updateState(prev => {
        const newFailedRequests = new Set(prev.failedRequests);
        newFailedRequests.delete(requestKey);
        return { ...prev, failedRequests: newFailedRequests };
      });
    }

    // Verifica se já está na fila ou falhou anteriormente (exceto se forceRetry)
    if (!forceRetry && (state.requestQueue.has(requestKey) || state.failedRequests.has(requestKey))) {
      console.log('🔍 [MediaAnalysis] Requisição ignorada:', state.requestQueue.has(requestKey) ? 'JÁ NA FILA' : 'JÁ FALHOU');
      return null;
    }

    // Cancela requisição anterior se existir
    const existingController = state.abortControllers.get(requestKey);
    if (existingController) {
      existingController.abort();
    }

    // Criar novo AbortController
    const abortController = new AbortController();
    
    // Adicionar à fila e iniciar análise
    updateState(prev => ({
      ...prev,
      requestQueue: new Set(prev.requestQueue).add(requestKey),
      abortControllers: new Map(prev.abortControllers).set(requestKey, abortController),
      activeRequests: new Map(prev.activeRequests).set(requestKey, {
        startTime: Date.now(),
        attempt: 1
      }),
      analyzing: true,
      lastHeartbeat: Date.now()
    }));

    try {
      console.log('🚀 [MediaAnalysis] Iniciando análise:', { requestKey: requestKey.substring(0, 50) + '...' });

      const mediaType = getMediaType(mediaUrl);
      
      // Timeout Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Timeout: Análise não completada em ${REQUEST_TIMEOUT / 1000} segundos`));
        }, REQUEST_TIMEOUT);
        
        abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Análise cancelada'));
        });
      });

      // Análise Promise
      const analysisPromise = supabase.functions.invoke('analyze-media', {
        body: {
          mediaUrl,
          questionText,
          userAnswer,
          mediaType,
          timestamp: Date.now(),
          requestId: requestKey.substring(0, 8)
        }
      });

      // Race entre timeout e análise
      const response = await Promise.race([analysisPromise, timeoutPromise]) as any;

      console.log('✅ [MediaAnalysis] Resposta recebida');

      if (response.error) {
        throw new Error(response.error.message || 'Erro na análise de mídia');
      }

      if (!response.data) {
        throw new Error('Resposta vazia do servidor');
      }

      // Processar resultado
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
        psychosocialRiskDetected: false,
        confidence: 0.8,
        rawData: response.data,
        questionText,
        userAnswer
      };

      recordSuccess();
      console.log('🎉 [MediaAnalysis] Análise concluída com sucesso');
      return result;

    } catch (error: any) {
      console.error('❌ [MediaAnalysis] Falha na análise:', error.message);
      
      recordFailure();
      
      // Adicionar à lista de falhas
      updateState(prev => ({
        ...prev,
        failedRequests: new Set(prev.failedRequests).add(requestKey)
      }));
      
      // Mensagens de erro específicas
      if (error.message?.includes('Timeout')) {
        toast({ title: "Timeout", description: "Análise expirou. Verifique sua conexão e tente novamente.", variant: "destructive" });
      } else if (error.message?.includes('Rate limit')) {
        toast({ title: "Rate Limit", description: "Muitas análises simultâneas. Aguarde alguns segundos.", variant: "destructive" });
      } else if (error.message?.includes('cancelada')) {
        toast({ title: "Cancelado", description: "Análise cancelada.", variant: "default" });
      } else {
        toast({ title: "Erro", description: `Erro na análise: ${error.message || "Erro desconhecido"}`, variant: "destructive" });
      }
      
      return null;

    } finally {
      // Cleanup atômico
      updateState(prev => {
        const newQueue = new Set(prev.requestQueue);
        const newControllers = new Map(prev.abortControllers);
        const newActiveRequests = new Map(prev.activeRequests);
        
        newQueue.delete(requestKey);
        newControllers.delete(requestKey);
        newActiveRequests.delete(requestKey);

        return {
          ...prev,
          requestQueue: newQueue,
          abortControllers: newControllers,
          activeRequests: newActiveRequests,
          analyzing: newQueue.size > 0,
          lastHeartbeat: Date.now()
        };
      });
    }
  }, [generateRequestKey, isCircuitOpen, recordFailure, recordSuccess, state.requestQueue, state.failedRequests, state.abortControllers, updateState]);

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
    return state.failedRequests.has(requestKey);
  }, [generateRequestKey, state.failedRequests]);

  const retryAnalysis = useCallback(async (options: MediaAnalysisOptions): Promise<MediaAnalysisResult | null> => {
    return analyze({ ...options, forceRetry: true });
  }, [analyze]);

  const cancelAllAnalysis = useCallback(() => {
    console.log('🛑 [MediaAnalysis] Cancelando todas as análises');
    
    // Cancelar todas as requisições ativas
    state.abortControllers.forEach((controller) => {
      controller.abort();
    });
    
    // Limpar estado completamente
    updateState(prev => ({
      ...prev,
      requestQueue: new Set(),
      abortControllers: new Map(),
      activeRequests: new Map(),
      analyzing: false,
      lastHeartbeat: Date.now()
    }));
    
    toast({ title: "Cancelado", description: "Todas as análises foram canceladas", variant: "default" });
  }, [state.abortControllers, updateState]);

  const getAnalysisStatus = useCallback(() => {
    return {
      analyzing: state.analyzing,
      queueSize: state.requestQueue.size,
      failedCount: state.failedRequests.size,
      hasFailures: state.failedRequests.size > 0,
      circuitBreakerState: state.circuitBreaker.state,
      activeRequests: state.activeRequests.size
    };
  }, [state]);

  const resetAllState = useCallback(() => {
    console.log('🔄 [MediaAnalysis] Reset completo do estado');
    
    // Cancelar todas as requisições primeiro
    state.abortControllers.forEach((controller) => {
      controller.abort();
    });
    
    // Reset completo
    updateState(() => ({
      analyzing: false,
      requestQueue: new Set(),
      failedRequests: new Set(),
      abortControllers: new Map(),
      circuitBreaker: { failures: 0, lastFailure: 0, state: 'CLOSED' },
      lastHeartbeat: Date.now(),
      activeRequests: new Map()
    }));
    
    toast({ title: "Reset", description: "Estado da análise foi resetado completamente", variant: "default" });
  }, [state.abortControllers, updateState]);

  // Debugging para desenvolvimento
  const getDebugInfo = useCallback(() => {
    return {
      state: {
        analyzing: state.analyzing,
        queueSize: state.requestQueue.size,
        failedCount: state.failedRequests.size,
        activeRequests: state.activeRequests.size,
        circuitBreaker: state.circuitBreaker
      },
      queue: Array.from(state.requestQueue),
      failed: Array.from(state.failedRequests),
      active: Array.from(state.activeRequests.entries())
    };
  }, [state]);

  return {
    analyze,
    analyzing: state.analyzing,
    canRetry,
    retryAnalysis,
    cancelAllAnalysis,
    getAnalysisStatus,
    resetAllState,
    getDebugInfo
  };
}