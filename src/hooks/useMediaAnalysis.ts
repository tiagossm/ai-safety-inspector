
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MediaAnalysisResult {
  analysis: string;
  hasNonConformity: boolean;
  psychosocialRiskDetected: boolean;
  actionPlanSuggestion: string | null;
  rawResponse?: any;
  // Add these fields to match usage in components
  type?: string;
  imageAnalysis?: string;
  videoAnalysis?: string;
  transcription?: string;
  questionText?: string;
}

interface AnalyzeParams {
  mediaUrl: string;
  mediaType?: string | null;
  questionText?: string;
  multimodalAnalysis?: boolean;
  additionalMediaUrls?: string[];
}

export function useMediaAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = async ({
    mediaUrl,
    mediaType,
    questionText,
    multimodalAnalysis = false,
    additionalMediaUrls = []
  }: AnalyzeParams): Promise<MediaAnalysisResult> => {
    setAnalyzing(true);

    try {
      // Determine content type if not provided
      const contentType = mediaType || determineContentType(mediaUrl);

      console.log('Starting media analysis:', {
        mediaUrl,
        contentType,
        questionText,
        multimodalAnalysis,
        additionalUrls: additionalMediaUrls?.length || 0
      });

      // Call the analyze-media Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-media', {
        body: {
          mediaUrl,
          contentType,
          questionText,
          multimodalAnalysis,
          additionalMediaUrls
        },
      });

      if (error) {
        console.error('Error analyzing media:', error);
        toast.error('Erro ao analisar mídia: ' + (error.message || 'Erro desconhecido'));
        throw error;
      }

      console.log('Analysis result:', data);
      
      // Extrair a sugestão de plano de ação do resultado da análise
      let actionPlanSuggestion = data.actionPlanSuggestion || null;
      
      // Se não tiver uma sugestão de plano de ação mas tiver uma não-conformidade,
      // vamos tentar extrair do texto da análise
      if (!actionPlanSuggestion && data.hasNonConformity) {
        actionPlanSuggestion = extractActionPlanFromText(data.analysis || '');
      }

      // Transform the raw response into the expected format
      const result: MediaAnalysisResult = {
        analysis: data.analysis || '',
        hasNonConformity: data.hasNonConformity || false,
        psychosocialRiskDetected: data.psychosocialRiskDetected || false,
        actionPlanSuggestion: actionPlanSuggestion,
        rawResponse: data,
        // Add additional properties that might be used in components
        type: data.type || (contentType.startsWith('image') ? 'image' : contentType.startsWith('video') ? 'video' : 'unknown'),
        imageAnalysis: data.imageAnalysis || data.analysis || '',
        videoAnalysis: data.videoAnalysis || data.analysis || '',
        transcription: data.transcription || '',
        questionText: questionText || data.questionText || ''
      };

      return result;
    } catch (error) {
      console.error('Error in media analysis:', error);
      toast.error('Erro ao processar análise: ' + (error as Error).message);
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper to determine content type from URL
  const determineContentType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (!extension) return 'image/jpeg'; // Default

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  };
  
  // Função melhorada para extrair planos de ação do texto da análise
  const extractActionPlanFromText = (text: string): string | null => {
    // Padrões comuns para identificar seções de planos de ação no texto
    const patterns = [
      /Plano de [Aa]ção [Ss]ugerido:([^]*?)(?=\n\n|\n$|$)/i,
      /Sugestão de [Pp]lano de [Aa]ção:([^]*?)(?=\n\n|\n$|$)/i,
      /Ação [Rr]ecomendada:([^]*?)(?=\n\n|\n$|$)/i,
      /Recomendaç[õo]es:([^]*?)(?=\n\n|\n$|$)/i,
      /Plano de [Aa]ção:([^]*?)(?=\n\n|\n$|$)/i,
      /Aç[õo]es [Rr]ecomendadas:([^]*?)(?=\n\n|\n$|$)/i,
      /Medidas [Cc]orretivas:([^]*?)(?=\n\n|\n$|$)/i,
      /Medidas a [Ss]erem [Aa]dotadas:([^]*?)(?=\n\n|\n$|$)/i
    ];
    
    // Tentar cada padrão em sequência
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Se não encontrou com os padrões específicos, procurar por uma seção intitulada 'Plano de Ação'
    // que pode estar em um formato diferente
    const sections = text.split(/\n\s*\n|\n\d+\.\s/);
    for (const section of sections) {
      if (/plano de ação|ações recomendadas|medidas corretivas/i.test(section)) {
        // Retornar a seção completa se contiver palavras-chave relevantes
        return section.replace(/^(plano de ação|ações recomendadas|medidas corretivas)[:\s]*/i, '').trim();
      }
    }
    
    return null;
  };

  return {
    analyze,
    analyzing
  };
}
