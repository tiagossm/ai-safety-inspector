
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
import { getFileType, getFilenameFromUrl } from "@/utils/fileUtils";
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
      console.log("MediaAnalysisDialog: Starting analysis");
      startAnalysis();
      setHasStarted(true);
    }
  }, [open, mediaUrl, hasStarted]);

  const startAnalysis = async () => {
    if (!mediaUrl) return;

    try {
      // Determine media type if not provided
      const mediaType = suppliedMediaType || getMediaType(mediaUrl);
      
      console.log("Starting analysis of media:", mediaUrl);
      console.log("Media type:", mediaType);
      console.log("Question text:", questionText);
      
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
        
        // Automatically close the dialog after successful analysis after a short delay
        setTimeout(() => {
          onOpenChange(false);
        }, 3000);
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
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">
                Erro na análise
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {error.message || "Ocorreu um erro durante a análise"}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  resetAnalysis();
                  setHasStarted(false);
                  startAnalysis();
                }}
              >
                Tentar novamente
              </Button>
            </div>
          ) : result ? (
            <div className="w-full">
              <div className="flex items-center mb-4">
                <Check className="h-5 w-5 mr-2 text-green-500" />
                <p className="font-medium">Análise completa</p>
              </div>
              
              {result.hasNonConformity && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                    <p className="text-sm font-medium text-amber-700">Possível não conformidade detectada</p>
                  </div>
                </div>
              )}
              
              {result.type === 'image' && result.analysis && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Análise de Imagem:</p>
                  <p className="text-sm text-muted-foreground border-l-2 border-muted p-2 mt-1 bg-muted/30">
                    {result.analysis}
                  </p>
                </div>
              )}
              
              {result.type === 'audio' && result.transcription && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Transcrição do Áudio:</p>
                  <p className="text-sm text-muted-foreground border-l-2 border-muted p-2 mt-1 bg-muted/30">
                    {result.transcription}
                  </p>
                </div>
              )}
              
              {result.type === 'video' && result.analysis && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Análise do Vídeo:</p>
                  <p className="text-sm text-muted-foreground border-l-2 border-muted p-2 mt-1 bg-muted/30">
                    {result.analysis}
                  </p>
                </div>
              )}
              
              {result.actionPlanSuggestion && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm font-medium text-green-700 mb-1">Sugestão de Plano de Ação:</p>
                  <p className="text-sm text-green-800">
                    {result.actionPlanSuggestion}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Clique em analisar para iniciar
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {!result && !isAnalyzing && (
            <Button onClick={startAnalysis} disabled={!mediaUrl || hasStarted}>
              {isAnalyzing ? "Analisando..." : "Analisar com IA"}
            </Button>
          )}
          {result && (
            <Button onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
