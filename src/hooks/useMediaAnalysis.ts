
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MediaAnalysisResult {
  analysis?: string;
  type?: string;
  analysisType?: string;
  actionPlanSuggestion?: string;
  hasNonConformity?: boolean;
  psychosocialRiskDetected?: boolean;
  questionText?: string;
  userAnswer?: string;
  confidence?: number;
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

  // Debounce para evitar requests duplicados
  const debounceTimeouts = new Map<string, NodeJS.Timeout>();

  const analyze = useCallback(async (options: MediaAnalysisOptions & { forceRetry?: boolean }): Promise<any | null> => {
    const { mediaUrl, questionText, userAnswer, multimodalAnalysis, additionalMediaUrls, mediaType, forceRetry = false } = options;
    
    if (!mediaUrl) {
      toast.error("URL de mídia inválida para análise");
      return null;
    }

    // Gerar chave única para deduplicação
    const requestKey = `${mediaUrl}-${questionText}-${userAnswer}`;
    
    // Verificar se já há uma requisição em andamento
    if (requestQueue.has(requestKey) && !forceRetry) {
      console.log("Requisição já em andamento para esta mídia, ignorando...");
      return null;
    }
    
    // Se forceRetry for true, limpar falhas anteriores
    if (forceRetry) {
      setFailedRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
    }

    // Cancelar timeout anterior se existir
    if (debounceTimeouts.has(requestKey)) {
      clearTimeout(debounceTimeouts.get(requestKey)!);
    }

    // Implementar debounce de 500ms
    return new Promise((resolve) => {
      const timeoutId = setTimeout(async () => {
        debounceTimeouts.delete(requestKey);
        
        if (requestQueue.has(requestKey)) {
          resolve(null);
          return;
        }

        setRequestQueue(prev => new Set([...prev, requestKey]));
        setAnalyzing(true);
        
        try {
          // Determinar o tipo de mídia
          const detectedMediaType = mediaType || getMediaType(mediaUrl);
          
          // Construir o payload para a função Edge
          const payload = {
            mediaUrl,
            questionText: questionText || "",
            userAnswer: userAnswer || "",
            questionId: "temp-id"
          };
          
          console.log("Enviando análise de mídia com payload:", payload);
          
          // Implementar retry com delay entre tentativas
          let lastError: any = null;
          const maxRetries = 3;
          
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              // Adicionar delay entre tentativas para evitar rate limit
              if (attempt > 0) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                console.log(`Tentativa ${attempt + 1}/${maxRetries + 1} após ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
              }

              const { data, error } = await supabase.functions.invoke('analyze-media', {
                body: payload
              });
              
              if (error) {
                lastError = error;
                
                // Se for erro de rate limit, tenta novamente
                if (error.message?.includes('Rate limit') && attempt < maxRetries) {
                  console.log(`Rate limit detectado, tentando novamente...`);
                  continue;
                }
                
                throw error;
              }
              
              console.log("Resultado da análise:", data);
              
              // Verificar se o resultado tem a estrutura esperada
              if (!data) {
                throw new Error("Resposta da análise de mídia vazia");
              }
              
              // Retornar resultado direto do edge function
              const result = {
                ...data, // { comment, actionPlan, raw }
                type: detectedMediaType,
                questionText,
                userAnswer
              };
              
              resolve(result);
              return;
              
            } catch (error: any) {
              lastError = error;
              
              if (attempt === maxRetries) {
                console.error("Erro durante análise de mídia após todas as tentativas:", error);
                
                // Mensagem de erro específica para rate limit
                if (error.message?.includes('Rate limit')) {
                  toast.error("Muitas análises simultâneas. Tente novamente em alguns segundos.");
                } else {
                  toast.error(`Erro durante análise: ${error.message || "Erro desconhecido"}`);
                }
                
                // Marcar como falha para permitir retry
                setFailedRequests(prev => new Set([...prev, requestKey]));
                resolve(null);
                return;
              }
            }
          }
          
        } catch (error: any) {
          console.error("Erro durante análise de mídia:", error);
          toast.error(`Erro durante análise: ${error.message || "Erro desconhecido"}`);
          // Marcar como falha para permitir retry
          setFailedRequests(prev => new Set([...prev, requestKey]));
          resolve(null);
        } finally {
          setAnalyzing(false);
          setRequestQueue(prev => {
            const newSet = new Set(prev);
            newSet.delete(requestKey);
            return newSet;
          });
        }
      }, 500); // Debounce de 500ms

      debounceTimeouts.set(requestKey, timeoutId);
    });
  }, [requestQueue]);
  
  // Função auxiliar para determinar o tipo de mídia
  const getMediaType = (url: string): string => {
    if (!url) return 'unknown';
    
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension || '')) {
      return 'video';
    } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) {
      return 'audio';
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return 'document';
    }
    
    return 'unknown';
  };

  // Função para verificar se há conteúdo no plano de ação
  const hasActionPlanContent = (actionPlan: any) => {
    if (!actionPlan) return false;
    return actionPlan.what || actionPlan.why || actionPlan.who || actionPlan.when || actionPlan.where || actionPlan.how;
  };

  // Função para formatar o plano de ação em texto
  const formatActionPlan = (actionPlan: any) => {
    if (!actionPlan || !hasActionPlanContent(actionPlan)) return null;
    
    let formatted = "Plano de Ação 5W2H:\n\n";
    if (actionPlan.what) formatted += `**O quê (What):** ${actionPlan.what}\n`;
    if (actionPlan.why) formatted += `**Por quê (Why):** ${actionPlan.why}\n`;
    if (actionPlan.who) formatted += `**Quem (Who):** ${actionPlan.who}\n`;
    if (actionPlan.when) formatted += `**Quando (When):** ${actionPlan.when}\n`;
    if (actionPlan.where) formatted += `**Onde (Where):** ${actionPlan.where}\n`;
    if (actionPlan.how) formatted += `**Como (How):** ${actionPlan.how}\n`;
    formatted += `**Quanto custa (How much):** [A ser preenchido]\n`;
    
    return formatted.trim();
  };

  // Função para verificar se uma requisição falhou
  const canRetry = useCallback((mediaUrl: string, questionText: string, userAnswer?: string) => {
    const requestKey = `${mediaUrl}-${questionText}-${userAnswer}`;
    return failedRequests.has(requestKey);
  }, [failedRequests]);

  // Função para forçar retry
  const retryAnalysis = useCallback((options: MediaAnalysisOptions) => {
    return analyze({ ...options, forceRetry: true });
  }, [analyze]);

  return {
    analyze,
    analyzing,
    canRetry,
    retryAnalysis
  };
}
