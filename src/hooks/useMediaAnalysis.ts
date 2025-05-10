
import { useState } from "react";
import { toast } from "sonner";

export interface MediaAnalysisResult {
  type?: "image" | "video" | "audio" | "multimodal";
  analysis?: string;
  transcription?: string;
  summary?: string;
  hasNonConformity?: boolean;
  confidence?: number;
  actionPlanSuggestion?: string;
  questionText?: string;
  imageAnalysis?: string;
  audioTranscription?: string;
  audioSentiment?: string;
  videoAnalysis?: string;
}

interface AnalyzeOptions {
  mediaUrl?: string | null;
  mediaType?: string | null;
  questionText?: string;
  responseValue?: boolean | null;
  mediaUrls?: string[];
  multimodal?: boolean;
}

export function useMediaAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MediaAnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const analyze = async (options: AnalyzeOptions): Promise<MediaAnalysisResult> => {
    const { 
      mediaUrl, 
      mediaType, 
      questionText = "", 
      responseValue,
      mediaUrls = [],
      multimodal = false
    } = options;

    try {
      setAnalyzing(true);
      setError(null);
      
      console.log("useMediaAnalysis: Starting analysis with options:", options);
      
      // For demonstration purposes, simulate a delayed response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let analysisResult: MediaAnalysisResult = {};
      
      // Initialize result structure based on analysis type
      if (multimodal) {
        console.log("useMediaAnalysis: Performing multimodal analysis");
        
        // Simulated multimodal analysis
        const hasImage = mediaUrls.some(url => url.match(/\.(jpeg|jpg|gif|png)$/i));
        const hasAudio = mediaUrls.some(url => url.match(/\.(mp3|wav|ogg)$/i));
        const hasVideo = mediaUrls.some(url => url.match(/\.(mp4|webm|mov)$/i));
        
        // Determine if the response indicates non-conformity
        const isNonConformity = responseValue === false;
        
        // Create appropriate analysis results
        analysisResult = {
          type: "multimodal",
          summary: createContextualSummary(questionText, responseValue, mediaUrls.length, isNonConformity),
          hasNonConformity: isNonConformity,
          questionText: questionText
        };
        
        // Add image analysis if images are present
        if (hasImage) {
          analysisResult.imageAnalysis = "A análise das imagens mostra " + 
            (isNonConformity 
              ? "problemas visíveis que precisam de atenção. Há elementos que não estão de acordo com os padrões esperados." 
              : "que todos os elementos visuais estão em conformidade com os padrões esperados."
            );
        }
        
        // Add audio analysis if audio is present
        if (hasAudio) {
          analysisResult.audioTranscription = "Transcrição: " + 
            (isNonConformity 
              ? "\"Identificamos problemas que precisam ser resolvidos neste item.\"" 
              : "\"Este item está em conformidade com os padrões estabelecidos.\""
            );
          
          analysisResult.audioSentiment = isNonConformity 
            ? "Preocupação com os problemas identificados"
            : "Confirmação positiva de conformidade";
        }
        
        // Generate action plan suggestion for non-conformity
        if (isNonConformity) {
          analysisResult.actionPlanSuggestion = generateStructuredActionPlan(questionText);
        }
        
        console.log("useMediaAnalysis: Multimodal analysis result:", analysisResult);
      } else if (mediaUrl) {
        console.log("useMediaAnalysis: Performing single media analysis for:", mediaUrl);
        
        // Determine media type from URL or provided type
        const type = determineMediaType(mediaUrl, mediaType);
        
        // Create appropriate analysis results
        analysisResult = {
          type,
          questionText,
          hasNonConformity: Math.random() > 0.5 // Randomly determine non-conformity
        };
        
        // Add type-specific analysis
        switch (type) {
          case "image":
            analysisResult.analysis = "Esta imagem mostra " + 
              (analysisResult.hasNonConformity 
                ? "elementos que não estão em conformidade com os padrões de segurança. É possível identificar problemas de organização e potenciais riscos." 
                : "que todos os elementos estão em conformidade com os padrões de segurança exigidos."
              );
            break;
            
          case "audio":
            analysisResult.transcription = "Transcrição do áudio: " + 
              (analysisResult.hasNonConformity 
                ? "\"Nós identificamos que este item não está em conformidade com nossas diretrizes.\"" 
                : "\"Este item está totalmente em conformidade com nossas diretrizes de segurança.\""
              );
            break;
            
          case "video":
            analysisResult.analysis = "Este vídeo demonstra " + 
              (analysisResult.hasNonConformity 
                ? "procedimentos incorretos que não seguem os protocolos de segurança." 
                : "procedimentos corretos que seguem todos os protocolos de segurança."
              );
            break;
        }
        
        // Generate action plan suggestion for non-conformity
        if (analysisResult.hasNonConformity) {
          analysisResult.actionPlanSuggestion = generateActionPlanSuggestion(type, questionText);
        }
        
        console.log("useMediaAnalysis: Single media analysis result:", analysisResult);
      } else {
        throw new Error("Nenhuma mídia fornecida para análise");
      }
      
      setResult(analysisResult);
      return analysisResult;
    } catch (err: any) {
      console.error("useMediaAnalysis: Error during analysis:", err);
      setError(err);
      toast.error("Erro ao analisar mídia", {
        description: err.message || "Ocorreu um erro durante a análise"
      });
      throw err;
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper function to determine media type from URL or provided type
  const determineMediaType = (url: string, providedType: string | null | undefined): "image" | "video" | "audio" => {
    if (providedType) {
      if (providedType.includes("image")) return "image";
      if (providedType.includes("video")) return "video";
      if (providedType.includes("audio")) return "audio";
    }
    
    // Try to determine from URL
    if (url.match(/\.(jpeg|jpg|gif|png)$/i)) return "image";
    if (url.match(/\.(mp4|webm|mov)$/i)) return "video";
    if (url.match(/\.(mp3|wav|ogg)$/i)) return "audio";
    
    // Default to image
    return "image";
  };

  // Helper function to create a contextual summary based on the question and response
  const createContextualSummary = (
    question: string, 
    response: boolean | null | undefined,
    mediaCount: number,
    isNonConformity: boolean
  ): string => {
    if (!question) return "Análise da inspeção realizada com base nas mídias fornecidas.";
    
    if (response === true) {
      return `A resposta "Sim" para a questão "${question}" indica conformidade. ${
        mediaCount > 0 
          ? `${mediaCount} mídia(s) analisada(s) confirma(m) esta avaliação.` 
          : "Nenhuma mídia adicional foi analisada."
      }`;
    }
    
    if (response === false) {
      return `A resposta "Não" para a questão "${question}" indica potencial não conformidade. ${
        mediaCount > 0 
          ? `${mediaCount} mídia(s) analisada(s) foi(ram) avaliada(s) neste contexto.` 
          : "Nenhuma mídia adicional foi analisada."
      }`;
    }
    
    return `Análise da questão "${question}" ${
      mediaCount > 0 
        ? `incluindo ${mediaCount} mídia(s) anexada(s).` 
        : "sem mídias anexadas."
    }`;
  };

  // Helper function to generate an action plan suggestion based on media type
  const generateActionPlanSuggestion = (mediaType: string, questionText: string): string => {
    const baseItems = [
      "Revisar os procedimentos e normas aplicáveis",
      "Registrar a não conformidade no sistema de gestão",
      "Agendar uma inspeção de acompanhamento"
    ];
    
    let specificItem = "";
    switch (mediaType) {
      case "image":
        specificItem = "Corrigir os problemas visíveis na foto conforme normas de segurança";
        break;
      case "audio":
        specificItem = "Implementar as correções mencionadas na gravação de áudio";
        break;
      case "video":
        specificItem = "Corrigir os procedimentos incorretos demonstrados no vídeo";
        break;
    }
    
    // Format as structured plan
    return `1. ${specificItem}\n2. ${baseItems[0]}\n3. ${baseItems[1]}\n4. ${baseItems[2]}`;
  };

  // Generate a more structured action plan based on question context
  const generateStructuredActionPlan = (questionText: string): string => {
    // Analyze question to generate more specific action items
    const keywords = [
      "segurança", "higiene", "proteção", "equipamento", "procedimento", 
      "documentação", "incidente", "manutenção", "treinamento"
    ];
    
    let foundKeyword = keywords.find(keyword => 
      questionText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    let specificItem = "";
    if (foundKeyword) {
      switch (foundKeyword) {
        case "segurança":
          specificItem = "Revisar e corrigir os procedimentos de segurança não conformes";
          break;
        case "higiene":
          specificItem = "Implementar medidas corretivas para os problemas de higiene identificados";
          break;
        case "proteção":
          specificItem = "Garantir o uso adequado dos equipamentos de proteção necessários";
          break;
        case "equipamento":
          specificItem = "Realizar manutenção ou substituição dos equipamentos não conformes";
          break;
        case "procedimento":
          specificItem = "Revisar e atualizar os procedimentos operacionais não conformes";
          break;
        case "documentação":
          specificItem = "Atualizar a documentação inadequada ou incompleta";
          break;
        case "incidente":
          specificItem = "Investigar causas do incidente e implementar medidas preventivas";
          break;
        case "manutenção":
          specificItem = "Programar manutenção corretiva para os itens não conformes";
          break;
        case "treinamento":
          specificItem = "Providenciar treinamento adicional para a equipe envolvida";
          break;
      }
    } else {
      specificItem = "Corrigir as não conformidades identificadas na inspeção";
    }
    
    // Standard action plan structure
    return `1. ${specificItem}\n2. Documentar as ações corretivas implementadas\n3. Realizar verificação após implementação\n4. Atualizar o registro de não conformidades`;
  };

  return { analyze, analyzing, result, error };
}
