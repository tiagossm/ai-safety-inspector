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
  transcript?: string;
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

  // Função aprimorada para detectar tipo de .webm
  const getMediaType = (url: string): string => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension || '')) {
      // Decisão: .webm pode ser áudio ou vídeo. O padrão será 'video', MAS:
      // Se houver WebM e content-type (muito difícil pegar pelo url), vamos exigir mediaType correto no nível do botão.
      if (extension === "webm") {
        // Para URL, heurística: webm de áudio, muitos têm 'audio' no path, senão vai pelo mediaType do componente
        // Aqui, não há acesso ao content-type, então esperamos que o usuário ou UX (botão) envie mediaType correto
        // Só garantimos que se passar mediaType='audio', enviamos assim
        // Retorna video por padrão para .webm, o back corrigirá
        return 'video';
      }
      return 'video';
    } else if (['mp3', 'wav', 'ogg', 'm4a', 'webm'].includes(extension || '')) {
      // .webm aparece aqui também: só deve cair como áudio se o botão/UX for de áudio
      return 'audio';
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return 'document';
    }
    return 'unknown';
  };

  // Checagem extra para .webm áudio no contexto UI
  const isWebmAudioUrl = (url: string, mediaType?: string): boolean => {
    if (!url) return false;
    const isWebm = url.toLowerCase().endsWith('.webm');
    if (!isWebm) return false;
    // Preferência: se mediaType foi definido explicitamente como áudio, confiaremos nele
    if (mediaType && mediaType === 'audio') return true;
    // Heurística: nomes/paths comuns de áudio
    if (url.toLowerCase().includes('/audio/') || url.toLowerCase().includes('audio.webm')) return true;
    // Poderíamos adicionar mais padrões se necessário no futuro
    return false;
  };

  const analyze = useCallback(async (options: MediaAnalysisOptions): Promise<MediaAnalysisResult | null> => {
    const { mediaUrl, questionText, userAnswer, multimodalAnalysis, additionalMediaUrls, mediaType } = options;
    if (!mediaUrl) {
      toast.error("URL de mídia inválida para análise");
      return null;
    }

    // Cache...
    const allUrls = [mediaUrl, ...(additionalMediaUrls || [])].sort().join(',');
    const cacheKey = `${allUrls}-${questionText}-${userAnswer || ''}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log("Retornando resultado do cache para:", mediaUrl);
      return cached.result;
    }

    setAnalyzing(true);

    try {
      // Detecção robusta do tipo: se for .webm, decide pelo mediaType recebido OU heurística
      let detectedMediaType = mediaType || getMediaType(mediaUrl);
      let webmIsAudio = false;
      if (mediaUrl && mediaUrl.toLowerCase().endsWith('.webm')) {
        webmIsAudio = isWebmAudioUrl(mediaUrl, mediaType);
        if (webmIsAudio) detectedMediaType = 'audio';
        // Se não crava áudio, deixa como video (o edge tratará também)
      }

      const payload = {
        mediaUrl,
        questionText: questionText || "",
        userAnswer: userAnswer || "",
        mediaType: detectedMediaType,
        multimodalAnalysis: multimodalAnalysis || false,
        additionalMediaUrls: additionalMediaUrls || [],
        isWebmAudio: webmIsAudio, // NOVO: esse campo será lido no edge function!
      };

      console.log("[useMediaAnalysis] Enviando análise de mídia:", payload);

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

      let plan5w2hObj: Plan5W2H | null = null;
      if (data.plan5w2h && typeof data.plan5w2h === "object") {
        plan5w2hObj = { ...data.plan5w2h };
      }

      let actionPlanSuggestionText: string | null = null;
      if (plan5w2hObj && data.hasNonConformity) {
        const { what, why, who, when, where, how } = plan5w2hObj;
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
        analysisType: data.analysisType || detectedMediaType,
        transcript: data.transcript,
        actionPlanSuggestion: actionPlanSuggestionText,
        hasNonConformity: !!data.hasNonConformity,
        psychosocialRiskDetected: !!data.psychosocialRiskDetected,
        questionText,
        userAnswer,
        confidence: data.confidence || 0,
        plan5w2h: plan5w2hObj,
      };

      analysisCache.set(cacheKey, { result, timestamp: Date.now() });

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

  const clearCache = useCallback(() => {
    analysisCache.clear();
  }, []);

  return {
    analyze,
    analyzing,
    clearCache
  };
}
