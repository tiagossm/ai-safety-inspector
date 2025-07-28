import { useState, useCallback } from "react";
import { useMediaAnalysis, MediaAnalysisResult, MediaAnalysisOptions } from "./useMediaAnalysis";

export interface SequentialAnalysisState {
  pending: string[];
  processing: string | null;
  completed: Map<string, MediaAnalysisResult>;
  failed: Map<string, string>;
}

export function useSequentialMediaAnalysis() {
  const { analyze, analyzing } = useMediaAnalysis();
  const [state, setState] = useState<SequentialAnalysisState>({
    pending: [],
    processing: null,
    completed: new Map(),
    failed: new Map()
  });

  const analyzeSequentially = useCallback(async (
    mediaUrls: string[],
    questionText: string,
    userAnswer?: string
  ) => {
    if (mediaUrls.length === 0) return;

    // Reinicializar estado
    setState({
      pending: [...mediaUrls],
      processing: null,
      completed: new Map(),
      failed: new Map()
    });

    // Processar cada imagem sequencialmente
    for (let i = 0; i < mediaUrls.length; i++) {
      const mediaUrl = mediaUrls[i];
      
      setState(prev => ({
        ...prev,
        processing: mediaUrl,
        pending: prev.pending.filter(url => url !== mediaUrl)
      }));

      try {
        const options: MediaAnalysisOptions = {
          mediaUrl,
          questionText,
          userAnswer
        };

        const result = await analyze(options);
        
        if (result) {
          setState(prev => ({
            ...prev,
            completed: new Map(prev.completed).set(mediaUrl, result),
            processing: null
          }));
        } else {
          setState(prev => ({
            ...prev,
            failed: new Map(prev.failed).set(mediaUrl, "Falha na análise"),
            processing: null
          }));
        }

        // Adicionar delay entre análises para evitar rate limit
        if (i < mediaUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

      } catch (error: any) {
        setState(prev => ({
          ...prev,
          failed: new Map(prev.failed).set(mediaUrl, error.message || "Erro desconhecido"),
          processing: null
        }));
      }
    }
  }, [analyze]);

  const retryFailedAnalysis = useCallback(async (
    mediaUrl: string,
    questionText: string,
    userAnswer?: string
  ) => {
    setState(prev => ({
      ...prev,
      processing: mediaUrl,
      failed: new Map(Array.from(prev.failed).filter(([url]) => url !== mediaUrl))
    }));

    try {
      const options: MediaAnalysisOptions = {
        mediaUrl,
        questionText,
        userAnswer
      };

      const result = await analyze(options);
      
      if (result) {
        setState(prev => ({
          ...prev,
          completed: new Map(prev.completed).set(mediaUrl, result),
          processing: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          failed: new Map(prev.failed).set(mediaUrl, "Falha na análise"),
          processing: null
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        failed: new Map(prev.failed).set(mediaUrl, error.message || "Erro desconhecido"),
        processing: null
      }));
    }
  }, [analyze]);

  const resetAnalysis = useCallback(() => {
    setState({
      pending: [],
      processing: null,
      completed: new Map(),
      failed: new Map()
    });
  }, []);

  const isComplete = state.pending.length === 0 && !state.processing;
  const hasResults = state.completed.size > 0;
  const hasErrors = state.failed.size > 0;
  const totalProcessed = state.completed.size + state.failed.size;

  return {
    state,
    analyzeSequentially,
    retryFailedAnalysis,
    resetAnalysis,
    isComplete,
    hasResults,
    hasErrors,
    totalProcessed,
    isAnalyzing: analyzing || !!state.processing
  };
}