
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
}

export function useMediaAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = useCallback(async (options: MediaAnalysisOptions): Promise<MediaAnalysisResult | null> => {
    const { mediaUrl, questionText, userAnswer, multimodalAnalysis, additionalMediaUrls } = options;
    
    if (!mediaUrl) {
      toast.error("URL de mídia inválida para análise");
      return null;
    }
    
    setAnalyzing(true);
    
    try {
      // Determinar o tipo de mídia
      const mediaType = getMediaType(mediaUrl);
      
      // Construir o payload para a função Edge
      const payload = {
        mediaUrl,
        questionText: questionText || "",
        userAnswer: userAnswer || "",
        mediaType,
        multimodalAnalysis: multimodalAnalysis || false,
        additionalMediaUrls: additionalMediaUrls || []
      };
      
      console.log("Enviando análise de mídia com payload:", payload);
      
      // Chamar a função Edge para análise
      const { data, error } = await supabase.functions.invoke('analyze-media', {
        body: payload
      });
      
      if (error) {
        console.error("Erro na análise de mídia:", error);
        toast.error(`Erro na análise: ${error.message}`);
        return null;
      }
      
      console.log("Resultado da análise:", data);
      
      // Verificar se o resultado tem a estrutura esperada
      if (!data) {
        toast.error("Resposta da análise de mídia vazia");
        return null;
      }
      
      // Formatar resultado
      const result: MediaAnalysisResult = {
        analysis: data.analysis || data.transcript || "Sem análise disponível",
        type: mediaType,
        analysisType: data.analysisType || "general",
        actionPlanSuggestion: data.actionPlanSuggestion || null,
        hasNonConformity: data.hasNonConformity || false,
        psychosocialRiskDetected: data.psychosocialRiskDetected || false,
        questionText,
        userAnswer,
        confidence: data.confidence || 0
      };
      
      return result;
    } catch (error: any) {
      console.error("Erro durante análise de mídia:", error);
      toast.error(`Erro durante análise: ${error.message || "Erro desconhecido"}`);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);
  
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

  return {
    analyze,
    analyzing
  };
}
