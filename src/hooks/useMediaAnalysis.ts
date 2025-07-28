
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

  const analyze = useCallback(async (options: MediaAnalysisOptions): Promise<MediaAnalysisResult | null> => {
    const { mediaUrl, questionText, userAnswer, multimodalAnalysis, additionalMediaUrls, mediaType } = options;
    
    if (!mediaUrl) {
      toast.error("URL de mídia inválida para análise");
      return null;
    }
    
    setAnalyzing(true);
    
    try {
      // Determinar o tipo de mídia
      const detectedMediaType = mediaType || getMediaType(mediaUrl);
      
      // Construir o payload para a função Edge
      const payload = {
        mediaUrl,
        questionText: questionText || "",
        userAnswer: userAnswer || "",
        questionId: "temp-id" // Placeholder já que a function espera esse campo
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
        analysis: data.comment || "Sem análise disponível",
        type: detectedMediaType,
        analysisType: "5w2h",
        actionPlanSuggestion: formatActionPlan(data.actionPlan),
        hasNonConformity: hasActionPlanContent(data.actionPlan),
        psychosocialRiskDetected: false,
        questionText,
        userAnswer,
        confidence: 1
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

  return {
    analyze,
    analyzing
  };
}
