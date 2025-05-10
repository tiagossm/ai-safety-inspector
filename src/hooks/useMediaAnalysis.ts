
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { determineSpecificFileType } from "@/utils/fileTypeUtils";

export interface MediaAnalysisResult {
  type: 'image' | 'audio' | 'video';
  analysis?: string;
  transcription?: string;
  error?: boolean;
  simulated?: boolean;
  fileType?: string;
  questionText?: string;
}

export function useMediaAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MediaAnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyzeMedia = async (mediaUrl: string, mediaType: string, questionText?: string): Promise<MediaAnalysisResult | null> => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setResult(null);
      
      console.log("🔍 Iniciando análise de mídia:", mediaUrl, mediaType, "Pergunta:", questionText);
      
      if (!mediaUrl) {
        throw new Error("URL da mídia não fornecida");
      }

      if (!mediaType) {
        throw new Error("Tipo de mídia não fornecido");
      }
      
      // Ajustamos o tipo de mídia para melhor compatibilidade
      // Se for um arquivo webm de áudio, garantimos que seja tratado como áudio
      if (mediaUrl.includes('audio') && mediaUrl.endsWith('.webm')) {
        mediaType = 'audio/webm';
      }
      
      // Obter o tipo específico do arquivo com base na extensão
      const fileExtension = mediaUrl.split('.').pop()?.toLowerCase() || '';
      const specificFileType = determineSpecificFileType(fileExtension);
      
      console.log("Tipo de mídia detectado:", mediaType, "Tipo específico:", specificFileType);
      
      // Chamar o edge function para analisar a mídia
      const { data, error: functionError } = await supabase.functions.invoke('analyze-media', {
        body: { mediaUrl, mediaType, questionText }
      });
      
      if (functionError) {
        console.error("Erro na função analyze-media:", functionError);
        throw new Error(`Erro na análise de mídia: ${functionError.message || "Erro desconhecido"}`);
      }
      
      if (!data) {
        throw new Error("Nenhum dado retornado da análise");
      }

      // Verificar se a resposta indica erro interno na análise
      if (data.error === true) {
        const errorMessage = data.message || data.analysis || data.transcription || "Erro na análise de mídia";
        console.error("Erro interno na análise:", errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log("✅ Análise de mídia concluída:", data);
      
      // Verificar se é uma simulação devido à falta de API key
      if (data.simulated) {
        toast.warning("Usando análise simulada. Configure a API do OpenAI para resultados reais.", {
          duration: 6000
        });
      }
      
      // Adicionar o tipo específico de arquivo e a pergunta ao resultado
      const result = {
        ...(data as MediaAnalysisResult),
        fileType: specificFileType,
        questionText
      };
      
      setResult(result);
      
      return result;
    } catch (error: any) {
      console.error("Erro ao analisar mídia:", error);
      setError(error);
      
      // Mostrar toast com a mensagem de erro mais amigável
      const friendlyMessage = error.message?.includes("API do OpenAI") 
        ? "A análise falhou. Verifique se a chave da API OpenAI está configurada corretamente."
        : `Falha na análise: ${error.message || "Erro desconhecido"}`;
      
      toast.error(friendlyMessage);
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
  };

  return {
    analyzeMedia,
    resetAnalysis,
    isAnalyzing,
    result,
    error
  };
}
