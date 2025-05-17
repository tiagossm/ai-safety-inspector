
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MediaAnalysisResult {
  analysis: string;
  hasNonConformity: boolean;
  psychosocialRiskDetected: boolean;
  actionPlanSuggestion: string | null;
  rawResponse?: any;
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

      // Transform the raw response into the expected format
      const result: MediaAnalysisResult = {
        analysis: data.analysis || '',
        hasNonConformity: data.hasNonConformity || false,
        psychosocialRiskDetected: data.psychosocialRiskDetected || false,
        actionPlanSuggestion: data.actionPlanSuggestion || null,
        rawResponse: data
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

  return {
    analyze,
    analyzing
  };
}
