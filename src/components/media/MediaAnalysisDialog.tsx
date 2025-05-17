import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMediaAnalysis, MediaAnalysisResult } from '@/hooks/useMediaAnalysis';
import { Loader2, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import ReactMarkdown from "react-markdown"; // <== Markdown support

interface MediaAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
  mediaType?: string | null;
  questionText?: string;
  onAnalysisComplete?: (result: MediaAnalysisResult) => void;
  onAddActionPlan?: (suggestion: string) => void;
  onAddComment?: (comment: string) => void;
  multimodalAnalysis?: boolean;
  mediaUrls?: string[];
  additionalMediaUrls?: string[];
}

export function MediaAnalysisDialog({
  open,
  onOpenChange,
  mediaUrl,
  mediaType,
  questionText = "",
  onAnalysisComplete,
  onAddActionPlan,
  onAddComment,
  multimodalAnalysis = false,
  mediaUrls = [],
  additionalMediaUrls = []
}: MediaAnalysisDialogProps) {
  const [analysisResult, setAnalysisResult] = useState<MediaAnalysisResult | null>(null);
  const { analyze, analyzing } = useMediaAnalysis();
  const [error, setError] = useState<string | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [isMultiModalAnalysis, setIsMultiModalAnalysis] = useState(false);

  useEffect(() => {
    const hasMultipleImages = (mediaUrls && mediaUrls.length > 1) || (additionalMediaUrls && additionalMediaUrls.length > 0);
    setIsMultiModalAnalysis(multimodalAnalysis || hasMultipleImages);
  }, [additionalMediaUrls, mediaUrls, multimodalAnalysis]);

  useEffect(() => {
    if (!open) {
      setAnalysisResult(null);
      setError(null);
      setShowFullAnalysis(false);
    }
  }, [open]);

  useEffect(() => {
    const runAnalysis = async () => {
      if (open && mediaUrl && !analyzing && !analysisResult) {
        try {
          setError(null);
          const imagesToAnalyze = mediaUrls && mediaUrls.length > 0 
            ? mediaUrls.filter(url => url !== mediaUrl) 
            : additionalMediaUrls;
            
          const result = await analyze({
            mediaUrl,
            mediaType,
            questionText,
            multimodalAnalysis: isMultiModalAnalysis,
            additionalMediaUrls: imagesToAnalyze
          });
          setAnalysisResult(result);
          if (onAnalysisComplete) {
            onAnalysisComplete(result);
          }
        } catch (err: any) {
          setError(err.message || "Error analyzing media");
        }
      }
    };
    runAnalysis();
  }, [open, mediaUrl, mediaType, questionText, analyzing, analyze, onAnalysisComplete, analysisResult, isMultiModalAnalysis, additionalMediaUrls, mediaUrls]);

  const renderMediaPreview = () => {
    if (!mediaUrl) return null;
    const isImage = mediaType?.startsWith('image') || mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    const isVideo = mediaType?.startsWith('video') || mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);
    if (isImage) {
      if (isMultiModalAnalysis) {
        const allImages = [mediaUrl];
        if (mediaUrls && mediaUrls.length > 0) {
          mediaUrls.forEach(url => {
            if (url !== mediaUrl) allImages.push(url);
          });
        } else if (additionalMediaUrls && additionalMediaUrls.length > 0) {
          additionalMediaUrls.forEach(url => allImages.push(url));
        }
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allImages.map((url, index) => (
              <div key={index} className={`col-span-1 sm:col-span-1 ${index === 0 ? 'border-green-300' : 'border-gray-200'}`}>
                <img 
                  src={url} 
                  alt={`Media ${index === 0 ? 'principal' : `adicional ${index}`}`} 
                  className={`w-full h-auto rounded-md border shadow-sm ${index === 0 ? 'border-green-300' : 'border-gray-200'}`} 
                />
                <p className="text-xs text-center mt-1 text-gray-500">
                  {index === 0 ? 'Imagem principal' : `Imagem adicional ${index}`}
                </p>
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <img 
            src={mediaUrl} 
            alt="Media" 
            className="max-h-[300px] rounded-md mx-auto"
          />
        );
      }
    }
    if (isVideo) {
      return (
        <video 
          src={mediaUrl} 
          controls 
          className="w-full max-h-[300px] rounded-md"
        />
      );
    }
    return (
      <div className="bg-gray-100 p-4 rounded-md text-center text-gray-500">
        Prévia não disponível para este tipo de mídia
      </div>
    );
  };

  // === PARSE FIELDS FOR PRESENTATION ===
  const analysis = analysisResult?.analysis ?? "";
  const actionPlanSuggestion = analysisResult?.actionPlanSuggestion ?? "";
  // Detect if there is markdown
  const renderMarkdown = (md: string) => <ReactMarkdown className="prose">{md}</ReactMarkdown>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isMultiModalAnalysis ? (
              <>Análise de Múltiplas Imagens</>
            ) : (
              <>Análise de Mídia</>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">{renderMediaPreview()}</div>

        {/* Contexto da questão */}
        {questionText && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md border">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Contexto da Questão:</h3>
            <p className="text-sm text-gray-600">{questionText}</p>
          </div>
        )}

        {analyzing && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-gray-600">Analisando mídia...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 rounded-md border border-red-200">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Erro na análise</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {analysisResult && !analyzing && (
          <div className="space-y-4">

            {/* Status */}
            <div className={`p-4 rounded-md border ${analysisResult.hasNonConformity ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center">
                {analysisResult.hasNonConformity ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                )}
                <h3 className={`text-base font-medium ${analysisResult.hasNonConformity ? 'text-amber-800' : 'text-green-800'}`}>
                  {analysisResult.hasNonConformity 
                    ? 'Não conformidade detectada' 
                    : 'Nenhuma não conformidade detectada'}
                </h3>
              </div>
            </div>

            {/* Detalhamento da análise */}
            {!!analysis && (
              <div className="border rounded-md p-4 bg-white">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Resultado da Análise:</h3>
                <div className="text-sm whitespace-pre-line">
                  {renderMarkdown(analysis)}
                </div>
              </div>
            )}

            {/* Plano de ação, se houver */}
            {analysisResult.hasNonConformity && !!actionPlanSuggestion && (
              <div className="border rounded-md p-4 bg-amber-50 border-amber-200">
                <div className="flex items-center mb-2">
                  <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
                  <h3 className="text-sm font-medium text-amber-800">Sugestão de Plano de Ação:</h3>
                </div>
                <div className="text-sm text-amber-700 whitespace-pre-line">
                  {renderMarkdown(actionPlanSuggestion)}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {analysisResult.hasNonConformity && !!actionPlanSuggestion && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    onAddActionPlan?.(actionPlanSuggestion);
                  }}
                >
                  Adicionar ação sugerida ao Plano de Ação
                </Button>
              )}

              {!analysisResult.hasNonConformity && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    onAddComment?.("Situação em conformidade conforme análise IA.");
                  }}
                >
                  Adicionar comentário de conformidade
                </Button>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}ss