
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
      
      console.log("🔍 Iniciando análise de mídia:", mediaUrl);
      console.log("Tipo de mídia:", mediaType);
      console.log("Pergunta:", questionText);
      
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
      
      console.log("Tipo de mídia detectado:", mediaType);
      console.log("Tipo específico:", specificFileType);
      
      // Simular análise para desenvolvimento (remova isto em produção)
      // Esta é uma solução provisória para teste durante desenvolvimento
      // Durante o desenvolvimento, vamos simular a análise para demonstrar a interface
      const simulateAnalysis = true;
      
      if (simulateAnalysis) {
        console.log("Usando análise simulada para desenvolvimento");
        
        // Esperar um tempo para simular processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Criar um resultado simulado com base no tipo de mídia
        const simulatedResult: MediaAnalysisResult = {
          type: mediaType.includes('image') ? 'image' : 
                mediaType.includes('audio') ? 'audio' : 'video',
          simulated: true,
          hasNonConformity: Math.random() > 0.5, // 50% de chance de ter não conformidade
          fileType: specificFileType,
          questionText: questionText
        };
        
        // Adicionar análise específica do tipo
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
        
        // Adicionar sugestão de plano de ação se houver não conformidade
        if (simulatedResult.hasNonConformity) {
          simulatedResult.actionPlanSuggestion = `Com base na análise, recomenda-se: 1) Realizar treinamento adicional sobre procedimentos de segurança; 2) Verificar disponibilidade e condições dos EPIs; 3) Programar nova inspeção em 15 dias para confirmar a correção das não conformidades.`;
        }
        
        console.log("Análise simulada concluída:", simulatedResult);
        setResult(simulatedResult);
        return simulatedResult;
      }
      
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
      
      // Garantir que os campos estejam no formato correto para evitar erros ao salvar no banco
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
