
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaAnalysis, MediaAnalysisResult } from '@/hooks/useMediaAnalysis';
import { Loader2, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

interface MediaAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
  mediaType: string | null;
  questionText?: string;
  onAnalysisComplete?: (result: MediaAnalysisResult) => void;
  additionalMediaUrls?: string[];
}

export function MediaAnalysisDialog({
  open,
  onOpenChange,
  mediaUrl,
  mediaType,
  questionText = "",
  onAnalysisComplete,
  additionalMediaUrls = []
}: MediaAnalysisDialogProps) {
  const [analysisResult, setAnalysisResult] = useState<MediaAnalysisResult | null>(null);
  const { analyze, analyzing } = useMediaAnalysis();
  const [error, setError] = useState<string | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [isMultiModalAnalysis, setIsMultiModalAnalysis] = useState(false);

  // Detectar se estamos fazendo análise multimodal
  useEffect(() => {
    setIsMultiModalAnalysis(additionalMediaUrls && additionalMediaUrls.length > 0);
  }, [additionalMediaUrls]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setAnalysisResult(null);
      setError(null);
      setShowFullAnalysis(false);
    }
  }, [open]);

  // Trigger analysis when dialog opens
  useEffect(() => {
    const runAnalysis = async () => {
      if (open && mediaUrl && !analyzing && !analysisResult) {
        try {
          setError(null);
          const result = await analyze({
            mediaUrl,
            mediaType,
            questionText,
            multimodalAnalysis: isMultiModalAnalysis,
            additionalMediaUrls
          });
          
          setAnalysisResult(result);
          
          if (onAnalysisComplete) {
            onAnalysisComplete(result);
          }
        } catch (err: any) {
          console.error("Error analyzing media:", err);
          setError(err.message || "Error analyzing media");
        }
      }
    };

    runAnalysis();
  }, [open, mediaUrl, mediaType, questionText, analyzing, analyze, onAnalysisComplete, analysisResult, isMultiModalAnalysis, additionalMediaUrls]);

  const renderMediaPreview = () => {
    if (!mediaUrl) return null;
    
    const isImage = mediaType?.startsWith('image') || mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    const isVideo = mediaType?.startsWith('video') || mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);
    
    if (isImage) {
      // Para análise multi-modal, mostrar todas as imagens (principal + adicionais)
      if (isMultiModalAnalysis && additionalMediaUrls.length > 0) {
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="col-span-1 sm:col-span-1">
              <img 
                src={mediaUrl} 
                alt="Media principal" 
                className="w-full h-auto rounded-md border border-green-300 shadow-sm" 
              />
              <p className="text-xs text-center mt-1 text-gray-500">Imagem principal</p>
            </div>
            {additionalMediaUrls.map((url, index) => (
              <div key={index} className="col-span-1 sm:col-span-1">
                <img 
                  src={url} 
                  alt={`Media adicional ${index + 1}`} 
                  className="w-full h-auto rounded-md border border-gray-200 shadow-sm" 
                />
                <p className="text-xs text-center mt-1 text-gray-500">Imagem adicional {index + 1}</p>
              </div>
            ))}
          </div>
        );
      } else {
        // Análise de imagem única
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

        {/* Media preview section */}
        <div className="mb-4">
          {renderMediaPreview()}
        </div>
        
        {/* Question context */}
        {questionText && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md border">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Contexto da Questão:</h3>
            <p className="text-sm text-gray-600">{questionText}</p>
          </div>
        )}
        
        {/* Loading state */}
        {analyzing && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-gray-600">Analisando mídia...</p>
          </div>
        )}
        
        {/* Error state */}
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
        
        {/* Analysis result */}
        {analysisResult && !analyzing && (
          <div className="space-y-4">
            {/* Result summary */}
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
            
            {/* Show full analysis or summary */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resultado da Análise:</h3>
              
              {showFullAnalysis ? (
                <div className="text-sm whitespace-pre-line">{analysisResult.analysis}</div>
              ) : (
                <div className="text-sm line-clamp-3">{analysisResult.analysis}</div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2" 
                onClick={() => setShowFullAnalysis(!showFullAnalysis)}
              >
                {showFullAnalysis ? 'Mostrar menos' : 'Mostrar mais'}
              </Button>
            </div>
            
            {/* Action plan suggestion if available */}
            {analysisResult.actionPlanSuggestion && (
              <div className="border rounded-md p-4 bg-amber-50 border-amber-200">
                <div className="flex items-center mb-2">
                  <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
                  <h3 className="text-sm font-medium text-amber-800">Sugestão de Plano de Ação:</h3>
                </div>
                <p className="text-sm text-amber-700 whitespace-pre-line">{analysisResult.actionPlanSuggestion}</p>
              </div>
            )}
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
}
