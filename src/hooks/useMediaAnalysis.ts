
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaAnalysisResult {
  type: 'image' | 'audio' | 'video';
  analysis?: string;
  transcription?: string;
}

export function useMediaAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MediaAnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyzeMedia = async (mediaUrl: string, mediaType: string): Promise<MediaAnalysisResult | null> => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      console.log("🔍 Iniciando análise de mídia:", mediaUrl, mediaType);
      
      // Chamar o edge function para analisar a mídia
      const { data, error } = await supabase.functions.invoke('analyze-media', {
        body: { mediaUrl, mediaType }
      });
      
      if (error) {
        console.error("Erro na análise de mídia:", error);
        throw error;
      }
      
      console.log("✅ Análise de mídia concluída:", data);
      setResult(data);
      
      return data;
    } catch (error: any) {
      console.error("Erro ao analisar mídia:", error);
      setError(error);
      toast.error(`Erro ao analisar mídia: ${error.message || "Erro desconhecido"}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeMedia,
    isAnalyzing,
    result,
    error
  };
}
