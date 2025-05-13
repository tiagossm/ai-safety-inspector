
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface MediaAnalysisResult {
  type?: "image" | "video" | "audio" | "multimodal";
  analysis?: string;
  transcription?: string;
  summary?: string;
  hasNonConformity?: boolean;
  psychosocialRiskDetected?: boolean;
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
      
      if (multimodal) {
        console.log("useMediaAnalysis: Performing multimodal analysis");
        
        // If we have multiple media files, analyze them together using the Edge Function
        if (mediaUrls && mediaUrls.length > 0) {
          const requestData = {
            mediaUrls,
            questionText,
            responseValue,
            multimodal: true
          };
          
          console.log("useMediaAnalysis: Calling Edge Function for multimodal analysis:", requestData);
          
          const { data, error } = await supabase.functions.invoke('analyze-media', {
            body: requestData
          });
          
          if (error) {
            console.error("useMediaAnalysis: Edge Function error:", error);
            throw new Error(`Erro na análise: ${error.message || "Erro desconhecido"}`);
          }
          
          console.log("useMediaAnalysis: Edge Function response:", data);
          
          // Standardize the response format for consistency between single and multimodal analyses
          const analysisResult: MediaAnalysisResult = {
            type: "multimodal",
            analysis: data.imageAnalysis || data.analysis, // Ensure we have an analysis field
            summary: data.summary || createContextualSummary(questionText, responseValue, mediaUrls.length, data.hasNonConformity),
            hasNonConformity: data.hasNonConformity,
            psychosocialRiskDetected: data.psychosocialRiskDetected,
            questionText: questionText,
            imageAnalysis: data.imageAnalysis,
            audioTranscription: data.audioTranscription,
            audioSentiment: data.audioSentiment,
            videoAnalysis: data.videoAnalysis || data.analysis,
            actionPlanSuggestion: data.actionPlanSuggestion || extractActionPlanSuggestion(data.imageAnalysis || data.analysis)
          };
          
          console.log("useMediaAnalysis: Multimodal analysis result:", analysisResult);
          setResult(analysisResult);
          return analysisResult;
        }
      } else if (mediaUrl) {
        console.log("useMediaAnalysis: Performing single media analysis for:", mediaUrl);
        
        // Determine media type from URL or provided type
        const type = determineMediaType(mediaUrl, mediaType);
        
        // Call the Edge Function for the analysis
        console.log("useMediaAnalysis: Calling Edge Function for", type, "analysis");
        
        const { data, error } = await supabase.functions.invoke('analyze-media', {
          body: {
            mediaUrl,
            mediaType: type,
            questionText,
            responseValue
          }
        });
        
        if (error) {
          console.error("useMediaAnalysis: Edge Function error:", error);
          throw new Error(`Erro na análise: ${error.message || "Erro desconhecido"}`);
        }
        
        console.log("useMediaAnalysis: Edge Function response:", data);
        
        // Standardize the response format for consistency with multimodal analysis
        const analysisResult: MediaAnalysisResult = {
          type,
          analysis: data.analysis,
          transcription: data.transcription,
          summary: data.summary || createContextualSummary(questionText, responseValue, 1, data.hasNonConformity),
          hasNonConformity: data.hasNonConformity,
          psychosocialRiskDetected: data.psychosocialRiskDetected,
          actionPlanSuggestion: data.actionPlanSuggestion || extractActionPlanSuggestion(data.analysis),
          questionText,
          imageAnalysis: type === "image" ? data.analysis : undefined,
          videoAnalysis: type === "video" ? data.analysis : undefined,
          audioTranscription: type === "audio" ? data.transcription : undefined
        };
        
        console.log("useMediaAnalysis: Single media analysis result:", analysisResult);
        setResult(analysisResult);
        return analysisResult;
      } else {
        throw new Error("Nenhuma mídia fornecida para análise");
      }
      
      // If we reach this point, it means we couldn't perform the analysis
      throw new Error("Parâmetros de análise inválidos");
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

  // Helper function to extract action plan suggestions from analysis text if not explicitly provided
  const extractActionPlanSuggestion = (analysisText?: string): string | undefined => {
    if (!analysisText) return undefined;
    
    // Look for common patterns that indicate an action plan suggestion in the analysis
    const actionPlanPatterns = [
      /Plano de ação sugerido:([^]*?)(?=\n\n|\n$|$)/i,
      /Sugestão de ação:([^]*?)(?=\n\n|\n$|$)/i,
      /Recomendação:([^]*?)(?=\n\n|\n$|$)/i,
      /Ação recomendada:([^]*?)(?=\n\n|\n$|$)/i
    ];
    
    for (const pattern of actionPlanPatterns) {
      const match = analysisText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return undefined;
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

  return { analyze, analyzing, result, error };
}
