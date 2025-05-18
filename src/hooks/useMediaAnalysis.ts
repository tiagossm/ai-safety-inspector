import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MediaAnalysisResult {
  analysis: string;
  psychosocialRiskDetected: boolean;
  actionPlanSuggestion: string | null;
  rawResponse?: any;
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
  userAnswer?: string;
  multimodalAnalysis?: boolean;
  additionalMediaUrls?: string[];
}

export function useMediaAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = async ({
    mediaUrl,
    mediaType,
    questionText,
    userAnswer,
    multimodalAnalysis = false,
    additionalMediaUrls = []
  }: AnalyzeParams): Promise<MediaAnalysisResult> => {
    setAnalyzing(true);

    try {
      const contentType = mediaType || determineContentType(mediaUrl);

      const { data, error } = await supabase.functions.invoke('analyze-media', {
        body: {
          mediaUrl,
          contentType,
          questionText,
          userAnswer,
          multimodalAnalysis,
          additionalMediaUrls
        },
      });

      if (error) {
        toast.error('Erro ao analisar mídia: ' + (error.message || 'Erro desconhecido'));
        throw error;
      }

      // Sempre tenta garantir que haja uma sugestão de plano de ação (seja do backend, seja extraído do texto)
      let actionPlanSuggestion = data.actionPlanSuggestion || extractActionPlanFromText(data.analysis || '');

      const result: MediaAnalysisResult = {
        analysis: data.analysis || '',
        psychosocialRiskDetected: data.psychosocialRiskDetected || false,
        actionPlanSuggestion: actionPlanSuggestion,
        rawResponse: data,
        type: data.type || (contentType.startsWith('image') ? 'image' : contentType.startsWith('video') ? 'video' : 'unknown'),
        imageAnalysis: data.imageAnalysis || data.analysis || '',
        videoAnalysis: data.videoAnalysis || data.analysis || '',
        transcription: data.transcription || '',
        questionText: questionText || data.questionText || ''
      };

      return result;
    } catch (error) {
      toast.error('Erro ao processar análise: ' + (error as Error).message);
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper para determinar o tipo de conteúdo pela extensão
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

  // Função para extrair plano de ação do texto, se necessário
  const extractActionPlanFromText = (text: string): string | null => {
    const patterns = [
      /Plano de [Aa]ção [Ss]ugerido:([^]*?)(?=\n\n|\n$|$)/i,
      /Sugestão de [Pp]lano de [Aa]ção:([^]*?)(?=\n\n|\n$|$)/i,
      /Ação [Rr]ecomendada:([^]*?)(?=\n\n|\n$|$)/i,
      /Recomendaç[õo]es:([^]*?)(?=\n\n|\n$|$)/i,
      /Plano de [Aa]ção:([^]*?)(?=\n\n|\n$|$)/i,
      /Aç[õo]es [Rr]ecomendadas:([^]*?)(?=\n\n|\n$|$)/i,
      /Medidas [Cc]orretivas:([^]*?)(?=\n\n|\n$|$)/i,
      /Medidas a [Ss]erem [Aa]dotadas:([^]*?)(?=\n\n|\n$|$)/i,
      /Para [Cc]orrigir [Ee]sta [Nn]ão [Cc]onformidade:([^]*?)(?=\n\n|\n$|$)/i,
      /Para [Rr]esolver [Ee]ste [Pp]roblema:([^]*?)(?=\n\n|\n$|$)/i,
      /[Ss]ugestões [Pp]ara [Cc]orreção:([^]*?)(?=\n\n|\n$|$)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    const sections = text.split(/\n\s*\n|\n\d+\.\s/);
    for (const section of sections) {
      if (/plano de ação|ações recomendadas|medidas corretivas|sugestões para correção|para corrigir|recomendações/i.test(section)) {
        return section.replace(/^(plano de ação|ações recomendadas|medidas corretivas|sugestões para correção|para corrigir|recomendações)[:\s]*/i, '').trim();
      }
    }

    const recommendationPattern = /(?:deve[- ]?se|recomenda[- ]?se|é necessário|é recomendado|é preciso)([^.!?]*[.!?])/i;
    const recommendationMatch = text.match(recommendationPattern);
    if (recommendationMatch && recommendationMatch[0]) {
      return recommendationMatch[0].trim();
    }

    if (text.length < 500) {
      return text.trim();
    }

    return null;
  };

  return {
    analyze,
    analyzing
  };
}
