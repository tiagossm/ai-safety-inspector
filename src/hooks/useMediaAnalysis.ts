
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
  actionPlanSuggestion?: string;
  hasNonConformity?: boolean;
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
      
      console.log("🔍 useMediaAnalysis: Iniciando análise de mídia:", mediaUrl);
      console.log("useMediaAnalysis: Tipo de mídia:", mediaType);
      console.log("useMediaAnalysis: Pergunta:", questionText);
      
      if (!mediaUrl) {
        throw new Error("URL da mídia não fornecida");
      }

      if (!mediaType) {
        throw new Error("Tipo de mídia não fornecido");
      }
      
      // Adjust media type for better compatibility
      // If it's a webm audio file, ensure it's treated as audio
      if (mediaUrl.includes('audio') && mediaUrl.endsWith('.webm')) {
        mediaType = 'audio/webm';
      }
      
      // Get specific file type based on extension
      const fileExtension = mediaUrl.split('.').pop()?.toLowerCase() || '';
      const specificFileType = determineSpecificFileType(fileExtension);
      
      console.log("useMediaAnalysis: Tipo de mídia detectado:", mediaType);
      console.log("useMediaAnalysis: Tipo específico:", specificFileType);
      
      // Simulate analysis for development (remove in production)
      // This is a temporary solution for testing during development
      const simulateAnalysis = true;
      
      if (simulateAnalysis) {
        console.log("useMediaAnalysis: Usando análise simulada para desenvolvimento");
        
        // Wait a bit to simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create a simulated result based on media type
        const simulatedResult: MediaAnalysisResult = {
          type: mediaType.includes('image') ? 'image' : 
                mediaType.includes('audio') ? 'audio' : 'video',
          simulated: true,
          hasNonConformity: Math.random() > 0.5, // 50% chance of non-conformity
          fileType: specificFileType,
          questionText: questionText
        };
        
        // Add type-specific analysis
        if (simulatedResult.type === 'image') {
          simulatedResult.analysis = `Na imagem analisada, observa-se ${Math.random() > 0.5 ? 
            'conformidade com os requisitos de segurança, com uso adequado de EPIs e procedimentos corretos' : 
            'possível não conformidade: falta de uso adequado de EPIs por parte de alguns funcionários'}`;
        } else if (simulatedResult.type === 'audio') {
          simulatedResult.transcription = `Transcrição do áudio: "Este é um registro de ${Math.random() > 0.5 ? 
            'inspeção realizada conforme procedimentos padrão' : 
            'uma situação que pode indicar não conformidade com os procedimentos de segurança'}."`;
        } else {
          simulatedResult.analysis = `Análise do vídeo: ${Math.random() > 0.5 ? 
            'O vídeo mostra procedimentos sendo executados corretamente, sem evidências de riscos à segurança' : 
            'O vídeo revela possíveis falhas nos procedimentos de segurança que precisam ser corrigidas'}`;
        }
        
        // Add action plan suggestion if there's non-conformity
        if (simulatedResult.hasNonConformity) {
          simulatedResult.actionPlanSuggestion = `Com base na análise, recomenda-se: 1) Realizar treinamento adicional sobre procedimentos de segurança; 2) Verificar disponibilidade e condições dos EPIs; 3) Programar nova inspeção em 15 dias para confirmar a correção das não conformidades.`;
        }
        
        console.log("useMediaAnalysis: Análise simulada concluída:", simulatedResult);
        setResult(simulatedResult);
        return simulatedResult;
      }
      
      // Call edge function to analyze media
      const { data, error: functionError } = await supabase.functions.invoke('analyze-media', {
        body: { mediaUrl, mediaType, questionText }
      });
      
      if (functionError) {
        console.error("useMediaAnalysis: Erro na função analyze-media:", functionError);
        throw new Error(`Erro na análise de mídia: ${functionError.message || "Erro desconhecido"}`);
      }
      
      if (!data) {
        throw new Error("Nenhum dado retornado da análise");
      }

      // Check if response indicates error in analysis
      if (data.error === true) {
        const errorMessage = data.message || data.analysis || data.transcription || "Erro na análise de mídia";
        console.error("useMediaAnalysis: Erro interno na análise:", errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log("✅ useMediaAnalysis: Análise de mídia concluída:", data);
      
      // Check if this is a simulation due to missing API key
      if (data.simulated) {
        toast.warning("Usando análise simulada. Configure a API do OpenAI para resultados reais.", {
          duration: 6000
        });
      }
      
      // Format result to avoid errors when saving to database
      const formattedResult: MediaAnalysisResult = {
        type: data.type || 'image',
        analysis: data.analysis || undefined,
        transcription: data.transcription || undefined,
        hasNonConformity: !!data.hasNonConformity,
        actionPlanSuggestion: data.actionPlanSuggestion || undefined,
        simulated: !!data.simulated,
        fileType: specificFileType,
        questionText: questionText || undefined,
      };
      
      setResult(formattedResult);
      
      return formattedResult;
    } catch (error: any) {
      console.error("useMediaAnalysis: Erro ao analisar mídia:", error);
      setError(error);
      
      // Show user-friendly error message
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
