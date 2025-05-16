
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, ScanSearch, Sparkles } from 'lucide-react';
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { useMediaAnalysis, MediaAnalysisResult } from '@/hooks/useMediaAnalysis';

interface MediaAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
  mediaType?: string | null;
  questionText?: string;
  onAnalysisComplete?: (result: MediaAnalysisResult) => void;
}

export function MediaAnalysisDialog({
  open,
  onOpenChange,
  mediaUrl,
  mediaType,
  questionText,
  onAnalysisComplete
}: MediaAnalysisDialogProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MediaAnalysisResult | null>(null);
  const { analyze, analyzing: isAnalyzing } = useMediaAnalysis();

  // Reset state when dialog closes or media changes
  useEffect(() => {
    if (!open) {
      setResult(null);
    }
  }, [open, mediaUrl]);

  const handleAnalyze = async () => {
    if (!mediaUrl) return;
    
    setAnalyzing(true);
    try {
      const analysisResult = await analyze({
        mediaUrl,
        mediaType,
        questionText
      });
      
      setResult(analysisResult);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (error) {
      console.error("Error analyzing media:", error);
    } finally {
      setAnalyzing(false);
    }
  };
  
  const renderResult = () => {
    if (!result) return null;
    
    const { analysis, hasNonConformity, psychosocialRiskDetected, actionPlanSuggestion } = result;
    
    return (
      <div className="mt-4 space-y-4">
        {hasNonConformity && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="font-medium text-red-700">⚠️ Não conformidade detectada!</p>
          </div>
        )}
        
        {psychosocialRiskDetected && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
            <p className="font-medium text-purple-700">⚠️ Risco psicossocial detectado!</p>
          </div>
        )}
        
        {analysis && (
          <div>
            <h4 className="font-medium mb-1">Análise:</h4>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-line">
              {analysis}
            </div>
          </div>
        )}
        
        {actionPlanSuggestion && (
          <div>
            <h4 className="font-medium mb-1 flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
              <span>Sugestão de Plano de Ação:</span>
            </h4>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md whitespace-pre-line text-amber-800">
              {actionPlanSuggestion}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Análise de Mídia</DialogTitle>
          <DialogDescription>
            Visualize e analise o conteúdo desta mídia
          </DialogDescription>
        </DialogHeader>
        
        {mediaUrl && (
          <div>
            <div className="mb-4 max-h-[300px] overflow-hidden flex justify-center border rounded">
              <MediaRenderer url={mediaUrl} className="object-contain max-h-[300px] w-auto" />
            </div>
            
            {!analyzing && !result && (
              <div className="mb-4 flex justify-center">
                <Button 
                  onClick={handleAnalyze}
                  disabled={analyzing || isAnalyzing}
                  className="w-full"
                >
                  {analyzing || isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <ScanSearch className="h-4 w-4 mr-2" />
                      Analisar esta Mídia
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {(analyzing || isAnalyzing) && !result && (
              <div className="p-8 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p>Analisando mídia com IA...</p>
              </div>
            )}
            
            {renderResult()}
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
