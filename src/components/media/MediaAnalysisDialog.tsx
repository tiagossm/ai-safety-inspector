
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Mic } from "lucide-react";
import { useMediaAnalysis } from "@/hooks/useMediaAnalysis";
import { getFileType } from "@/utils/fileUtils";

interface MediaAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
  mediaType?: string;
}

export function MediaAnalysisDialog({
  open,
  onOpenChange,
  mediaUrl,
  mediaType
}: MediaAnalysisDialogProps) {
  const { analyzeMedia, isAnalyzing, result, error } = useMediaAnalysis();
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!mediaUrl) return;
    
    const type = mediaType || getFileTypeFromUrl(mediaUrl);
    await analyzeMedia(mediaUrl, type);
    setHasAnalyzed(true);
  };

  const getFileTypeFromUrl = (url: string): string => {
    const fileType = getFileType(url);
    
    switch (fileType) {
      case 'image':
        return 'image/jpeg';
      case 'video':
        return 'video/mp4';
      case 'audio':
        return 'audio/mpeg';
      default:
        return 'application/octet-stream';
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 mb-4">
          <p className="font-medium mb-1">Erro ao analisar mídia</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }

    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-center text-muted-foreground">Analisando mídia com IA...</p>
          <p className="text-center text-xs text-muted-foreground mt-1">Isso pode levar alguns segundos.</p>
        </div>
      );
    }

    if (result) {
      return (
        <div className="space-y-4">
          {result.type === 'image' && result.analysis && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Camera className="h-4 w-4 mr-1 text-blue-500" />
                Análise da Imagem
              </h3>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{result.analysis}</p>
              </div>
            </div>
          )}
          
          {(result.type === 'audio' || result.type === 'video') && result.transcription && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Mic className="h-4 w-4 mr-1 text-green-500" />
                Transcrição
              </h3>
              <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{result.transcription}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Estado inicial, antes da análise
    return (
      <div className="text-center py-6">
        <p className="mb-4 text-muted-foreground">
          Utilize a inteligência artificial para analisar esta mídia.
        </p>
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          Analisar com IA
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Análise de Mídia com IA</DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          {mediaUrl && (
            <div className="mb-4">
              {getFileType(mediaUrl) === 'image' ? (
                <img 
                  src={mediaUrl} 
                  alt="Mídia para análise" 
                  className="max-h-40 max-w-full mx-auto rounded-md object-contain"
                />
              ) : getFileType(mediaUrl) === 'video' ? (
                <video 
                  src={mediaUrl}
                  controls
                  className="max-h-40 w-full mx-auto rounded-md"
                />
              ) : getFileType(mediaUrl) === 'audio' ? (
                <audio 
                  src={mediaUrl}
                  controls
                  className="w-full mx-auto"
                />
              ) : (
                <div className="p-4 bg-gray-100 text-center rounded-md">
                  Este tipo de mídia não pode ser visualizado.
                </div>
              )}
            </div>
          )}
          
          {renderContent()}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
          {hasAnalyzed && !isAnalyzing && (
            <Button 
              variant="default" 
              onClick={handleAnalyze}
              className="w-full sm:w-auto"
            >
              Analisar Novamente
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
