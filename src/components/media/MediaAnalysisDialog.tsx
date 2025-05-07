
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Mic, FileText, AlertCircle, Sparkles } from "lucide-react";
import { useMediaAnalysis } from "@/hooks/useMediaAnalysis";
import { getFileType } from "@/utils/fileUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true);

  useEffect(() => {
    // Resetar estado quando a modal é aberta com nova mídia
    if (open) {
      setHasAnalyzed(false);
    }
  }, [open, mediaUrl]);

  const handleAnalyze = async () => {
    if (!mediaUrl) {
      toast.error("URL da mídia não fornecida");
      return;
    }
    
    const type = mediaType || getFileTypeFromUrl(mediaUrl);
    
    try {
      toast.info("Iniciando análise de mídia...");
      console.log("Analisando mídia:", mediaUrl, type);
      
      const analysisResult = await analyzeMedia(mediaUrl, type);
      setHasAnalyzed(true);
      
      if (!analysisResult) {
        toast.error("Falha na análise de mídia");
        return;
      }
      
      // Verificar se a resposta contém indicação de que a API key não está configurada
      if (analysisResult && 
          ((analysisResult.analysis && analysisResult.analysis.includes("Configure a API do OpenAI")) || 
           (analysisResult.transcription && analysisResult.transcription.includes("Configure a API do OpenAI")))) {
        setApiKeyConfigured(false);
        toast.warning("A chave da API OpenAI não está configurada no servidor");
      } else {
        toast.success("Análise concluída com sucesso");
      }
    } catch (error: any) {
      console.error("Erro ao analisar mídia:", error);
      toast.error(`Erro: ${error.message || "Falha ao analisar mídia"}`);
      setHasAnalyzed(true);
    }
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

  const renderMediaPreview = () => {
    if (!mediaUrl) return null;
    
    const fileType = getFileType(mediaUrl);
    
    return (
      <div className="mb-4 border rounded-md overflow-hidden bg-muted/20">
        {fileType === 'image' ? (
          <img 
            src={mediaUrl} 
            alt="Mídia para análise" 
            className="max-h-40 max-w-full mx-auto object-contain"
          />
        ) : fileType === 'video' ? (
          <video 
            src={mediaUrl}
            controls
            className="max-h-40 w-full mx-auto"
          />
        ) : fileType === 'audio' ? (
          <div className="p-4 text-center">
            <Mic className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <audio 
              src={mediaUrl}
              controls
              className="w-full mx-auto"
            />
          </div>
        ) : (
          <div className="p-4 bg-gray-100 text-center rounded-md">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p>Este tipo de mídia não pode ser visualizado.</p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Erro ao analisar mídia</p>
            <p className="text-sm">{error.message}</p>
          </AlertDescription>
        </Alert>
      );
    }

    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          <p className="text-center text-muted-foreground">Analisando mídia com IA...</p>
          <p className="text-center text-xs text-muted-foreground mt-1">Isso pode levar alguns segundos.</p>
        </div>
      );
    }

    if (result) {
      if (!apiKeyConfigured) {
        return (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">A chave da API OpenAI não está configurada</p>
              <p className="text-sm mt-1">
                Para obter análises reais, configure a chave da API OpenAI nas configurações de funções do Supabase.
              </p>
            </AlertDescription>
          </Alert>
        );
      }

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
          
          {(result.type === 'video') && result.analysis && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Camera className="h-4 w-4 mr-1 text-purple-500" />
                Análise do Vídeo
              </h3>
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{result.analysis}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Estado inicial, antes da análise
    return (
      <div className="text-center py-6">
        <div className="mb-6">
          <Sparkles className="h-10 w-10 text-primary/60 mx-auto mb-2" />
          <p className="mb-3 text-muted-foreground">
            Utilize a inteligência artificial para analisar esta mídia.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            A IA pode identificar objetos, pessoas e situações em imagens, transcrever áudio e analisar quadros de vídeo.
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Analisar com IA
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Análise de Mídia com IA
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          {mediaUrl && renderMediaPreview()}
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
