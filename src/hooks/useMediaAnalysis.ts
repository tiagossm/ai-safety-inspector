
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Plan5W2H {
  what?: string;
  why?: string;
  who?: string;
  where?: string;
  when?: string;
  how?: string;
  howMuch?: string;
}

export interface MediaAnalysisResult {
  analysis?: string;
  type?: string;
  analysisType?: string;
  actionPlanSuggestion?: string | null;
  hasNonConformity?: boolean;
  psychosocialRiskDetected?: boolean;
  questionText?: string;
  userAnswer?: string;
  confidence?: number;
  plan5w2h?: Plan5W2H;
}

export interface MediaAnalysisOptions {
  mediaUrl: string;
  questionText: string;
  userAnswer?: string;
  multimodalAnalysis?: boolean;
  additionalMediaUrls?: string[];
  mediaType?: string;
}

// Cache simples para evitar análises duplicadas
const analysisCache = new Map<string, { result: MediaAnalysisResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useMediaAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = useCallback(async (options: MediaAnalysisOptions): Promise<MediaAnalysisResult | null> => {
    const { mediaUrl, questionText, userAnswer, multimodalAnalysis, additionalMediaUrls, mediaType } = options;
    
    if (!mediaUrl) {
      toast.error("URL de mídia inválida para análise");
      return null;
    }

    // Verifica cache primeiro
    const allUrls = [mediaUrl, ...(additionalMediaUrls || [])].sort().join(',');
    const cacheKey = `${allUrls}-${questionText}-${userAnswer || ''}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log("Retornando resultado do cache para:", mediaUrl);
      return cached.result;
    }
    
    setAnalyzing(true);
    
    try {
      const detectedMediaType = mediaType || getMediaType(mediaUrl);
      
      const payload = {
        mediaUrl,
        questionText: questionText || "",
        userAnswer: userAnswer || "",
        // Os parâmetros abaixo não são usados pela nova função, mas mantidos para compatibilidade
        mediaType: detectedMediaType,
        multimodalAnalysis: multimodalAnalysis || false,
        additionalMediaUrls: additionalMediaUrls || []
      };
      
      console.log("Enviando análise de mídia:", payload);
      
      const { data, error } = await supabase.functions.invoke('analyze-media', {
        body: payload
      });
      
      if (error) {
        console.error("Erro na análise de mídia:", error);
        toast.error(`Erro na análise: ${error.message}`);
        return null;
      }
      
      if (!data) {
        toast.error("Resposta da análise de mídia vazia");
        return null;
      }
      
      let actionPlanSuggestionText: string | null = null;
      if (data.plan5w2h && data.hasNonConformity) {
        const { what, why, who, when, where, how } = data.plan5w2h;
        const parts = [
          what && `- O quê: ${what}`,
          why && `- Por quê: ${why}`,
          who && `- Quem: ${who}`,
          when && `- Quando: ${when}`,
          where && `- Onde: ${where}`,
          how && `- Como: ${how}`,
        ].filter(Boolean);
        if (parts.length > 0) {
          actionPlanSuggestionText = `Plano de Ação Sugerido:\n${parts.join('\n')}`;
        }
      }

      const result: MediaAnalysisResult = {
        analysis: data.analysis || "Sem análise disponível",
        type: detectedMediaType,
        analysisType: data.analysisType || "general",
        actionPlanSuggestion: actionPlanSuggestionText,
        hasNonConformity: data.hasNonConformity || false,
        psychosocialRiskDetected: data.psychosocialRiskDetected || false,
        questionText,
        userAnswer,
        confidence: data.confidence || 0,
        plan5w2h: data.plan5w2h || null,
      };
      
      // Armazena no cache
      analysisCache.set(cacheKey, { result, timestamp: Date.now() });
      
      // Limpa cache antigo periodicamente
      if (analysisCache.size > 50) {
        const now = Date.now();
        for (const [key, value] of analysisCache.entries()) {
          if (now - value.timestamp > CACHE_DURATION) {
            analysisCache.delete(key);
          }
        }
      }
      
      return result;
    } catch (error: any) {
      console.error("Erro durante análise de mídia:", error);
      toast.error(`Erro durante análise: ${error.message || "Erro desconhecido"}`);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);
  
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

  // Função para limpar cache manualmente se necessário
  const clearCache = useCallback(() => {
    analysisCache.clear();
  }, []);

  return {
    analyze,
    analyzing,
    clearCache
  };
}
