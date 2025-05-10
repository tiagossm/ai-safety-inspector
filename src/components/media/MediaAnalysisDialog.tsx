
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Check, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaAnalysis, MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { getFileType } from "@/utils/fileUtils";
import { toast } from "sonner";

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
  mediaType: suppliedMediaType,
  questionText,
  onAnalysisComplete
}: MediaAnalysisDialogProps) {
  const { analyzeMedia, resetAnalysis, isAnalyzing, result, error } = useMediaAnalysis();
  const [hasStarted, setHasStarted] = useState(false);

  // Reset analysis when dialog opens/closes
  useEffect(() => {
    if (!open) {
      resetAnalysis();
      setHasStarted(false);
    }
  }, [open, resetAnalysis]);

  // Start analysis when dialog opens with a mediaUrl
  useEffect(() => {
    if (open && mediaUrl && !hasStarted) {
      startAnalysis();
      setHasStarted(true);
    }
  }, [open, mediaUrl, hasStarted]);

  const startAnalysis = async () => {
    if (!mediaUrl) return;

    try {
      // Determine media type if not provided
      const mediaType = suppliedMediaType || getMediaType(mediaUrl);
      
      console.log("Starting analysis of media:", mediaUrl, mediaType);
      
      const analysisResult = await analyzeMedia(mediaUrl, mediaType, questionText);
      
      if (analysisResult && onAnalysisComplete) {
        console.log("Analysis completed:", analysisResult);
        onAnalysisComplete(analysisResult);
        
        // Show a toast if non-conformity was detected
        if (analysisResult.hasNonConformity) {
          toast.info("IA detectou possível não conformidade", {
            description: "Foi sugerido um plano de ação baseado na análise.",
            duration: 5000,
            icon: <AlertTriangle className="h-4 w-4" />
          });
        }
        
        // Automatically close the dialog after successful analysis
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Error during analysis:", err);
    }
  };

  const getMediaType = (url: string): string => {
    const fileType = getFileType(url);
    
    switch (fileType) {
      case 'image':
        return 'image/jpeg';
      case 'video':
        return 'video/mp4';
      case 'audio':
        return 'audio/mp3';
      default:
        return 'application/octet-stream';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Análise com IA
          </DialogTitle>
          <DialogDescription>
            {isAnalyzing 
              ? "Analisando mídia com inteligência artificial..." 
              : (result 
                ? "Análise concluída" 
                : "Pronto para analisar")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          {isAnalyzing ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Analisando mídia com IA...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Isso pode levar alguns segundos
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="font-medium text-red-600 mb-1">Erro na análise</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error.message || "Ocorreu um erro ao analisar a mídia."}
              </p>
              <Button variant="outline" onClick={startAnalysis}>
                Tentar novamente
              </Button>
            </div>
          ) : result ? (
            <div className="w-full">
              <div className="flex items-center justify-center mb-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              
              <div className="text-center mb-4">
                <h3 className="font-medium">Análise concluída com sucesso</h3>
                {result.hasNonConformity && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-amber-700 flex items-center gap-1 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      Não conformidade detectada
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-4 max-h-[200px] overflow-y-auto text-sm">
                {result.type === 'image' && (
                  <div>
                    <p className="font-medium mb-1">Análise da imagem:</p>
                    <p className="text-muted-foreground whitespace-pre-line">{result.analysis}</p>
                  </div>
                )}
                
                {result.type === 'video' && (
                  <div>
                    <p className="font-medium mb-1">Análise do vídeo:</p>
                    <p className="text-muted-foreground whitespace-pre-line">{result.analysis}</p>
                  </div>
                )}
                
                {result.type === 'audio' && (
                  <div>
                    <p className="font-medium mb-1">Transcrição do áudio:</p>
                    <p className="text-muted-foreground whitespace-pre-line">{result.transcription}</p>
                  </div>
                )}
                
                {result.actionPlanSuggestion && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded mt-4">
                    <p className="font-medium text-amber-800 flex items-center gap-1 mb-1">
                      <Sparkles className="h-3 w-3" />
                      Sugestão para plano de ação:
                    </p>
                    <p className="text-amber-700 text-sm">{result.actionPlanSuggestion}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Pronto para analisar mídia com inteligência artificial.
              </p>
              <Button onClick={startAnalysis} disabled={!mediaUrl}>
                Iniciar Análise
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isAnalyzing}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
