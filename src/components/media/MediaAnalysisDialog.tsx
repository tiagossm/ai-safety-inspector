
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Check, AlertTriangle, Sparkles, Plus, MessageSquare, FileText, Image, FileVideo, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaAnalysis, MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { getFileType, getFilenameFromUrl } from "@/utils/fileUtils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface MediaAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
  mediaType?: string | null;
  questionText?: string;
  responseValue?: boolean | string | null;
  mediaUrls?: string[];
  onAnalysisComplete?: (result: MediaAnalysisResult) => void;
  multimodalAnalysis?: boolean;
}

export function MediaAnalysisDialog({
  open,
  onOpenChange,
  mediaUrl,
  mediaType: suppliedMediaType,
  questionText,
  responseValue,
  mediaUrls = [],
  onAnalysisComplete,
  multimodalAnalysis = false
}: MediaAnalysisDialogProps) {
  const { analyzeMedia, resetAnalysis, isAnalyzing, result, error } = useMediaAnalysis();
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("context");

  // Reset analysis when dialog opens/closes
  useEffect(() => {
    if (!open) {
      resetAnalysis();
      setHasStarted(false);
      setActiveTab("context");
    }
  }, [open, resetAnalysis]);

  // Start analysis when dialog opens
  useEffect(() => {
    const autoStartAnalysis = async () => {
      if (open && !hasStarted && !isAnalyzing && !result) {
        console.log("MediaAnalysisDialog: Auto-starting analysis");
        
        if (multimodalAnalysis) {
          await startMultimodalAnalysis();
        } else if (mediaUrl) {
          await startSingleMediaAnalysis();
        }
        
        setHasStarted(true);
      }
    };
    
    autoStartAnalysis();
  }, [open, mediaUrl, multimodalAnalysis, hasStarted, isAnalyzing, result, questionText]);

  const startSingleMediaAnalysis = async () => {
    if (!mediaUrl) return;

    try {
      // Determine media type if not provided
      const mediaType = suppliedMediaType || getMediaType(mediaUrl);
      
      console.log("MediaAnalysisDialog: Starting analysis of single media:", mediaUrl);
      console.log("MediaAnalysisDialog: Media type:", mediaType);
      console.log("MediaAnalysisDialog: Question text:", questionText);
      
      const analysisResult = await analyzeMedia(mediaUrl, mediaType, questionText);
      
      if (analysisResult && onAnalysisComplete) {
        // Ensure question context is included in result
        const resultWithContext = {
          ...analysisResult,
          questionText: questionText || analysisResult.questionText
        };
        
        console.log("MediaAnalysisDialog: Analysis completed with context:", resultWithContext);
        onAnalysisComplete(resultWithContext);
        
        // Show a toast if non-conformity was detected
        if (resultWithContext.hasNonConformity) {
          toast.info("IA detectou possível não conformidade", {
            description: "Foi sugerido um plano de ação baseado na análise.",
            duration: 5000,
            icon: <AlertTriangle className="h-4 w-4" />
          });
        }
      }
    } catch (err) {
      console.error("MediaAnalysisDialog: Error during analysis:", err);
    }
  };
  
  const startMultimodalAnalysis = async () => {
    try {
      console.log("MediaAnalysisDialog: Starting multimodal analysis");
      console.log("MediaAnalysisDialog: Question text:", questionText);
      console.log("MediaAnalysisDialog: Response value:", responseValue);
      console.log("MediaAnalysisDialog: Media URLs:", mediaUrls);
      
      // Prepare context data for multimodal analysis
      const contextData = {
        questionText,
        responseValue,
        mediaUrls
      };
      
      // For now, we'll use the analyzeMedia function with some adaptations for multimodal
      // In a real implementation, you might want a dedicated multimodal analysis endpoint
      const analysisResult = await analyzeMedia("multimodal", "multimodal/context", questionText, contextData);
      
      if (analysisResult && onAnalysisComplete) {
        // Add multimodal flag to result
        const resultWithContext = {
          ...analysisResult,
          questionText: questionText || analysisResult.questionText,
          isMultimodal: true,
          contextData
        };
        
        console.log("MediaAnalysisDialog: Multimodal analysis completed:", resultWithContext);
        onAnalysisComplete(resultWithContext);
      }
    } catch (err) {
      console.error("MediaAnalysisDialog: Error during multimodal analysis:", err);
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
  
  const getResponseText = () => {
    if (responseValue === true) return "Conformidade (Sim)";
    if (responseValue === false) return "Não Conformidade (Não)";
    if (responseValue === "sim") return "Conformidade (Sim)";
    if (responseValue === "não") return "Não Conformidade (Não)";
    if (responseValue === "n/a") return "Não Aplicável (N/A)";
    return "Sem resposta";
  };
  
  const getResponseBadgeClass = () => {
    if (responseValue === true || responseValue === "sim") 
      return "bg-green-100 text-green-800 border-green-300";
    if (responseValue === false || responseValue === "não") 
      return "bg-red-100 text-red-800 border-red-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {multimodalAnalysis ? "Análise Completa com IA" : "Análise de Mídia com IA"}
          </DialogTitle>
          <DialogDescription>
            {isAnalyzing 
              ? "Analisando com inteligência artificial..." 
              : (result 
                ? "Análise concluída" 
                : "Pronto para analisar")}
          </DialogDescription>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              {multimodalAnalysis ? "Analisando pergunta e respostas com IA..." : "Analisando mídia com IA..."}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Isso pode levar alguns segundos
            </p>
            {questionText && (
              <p className="text-xs text-muted-foreground mt-2">
                Analisando no contexto da pergunta: "{questionText}"
              </p>
            )}
          </div>
        ) : error ? (
          <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
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
                if (multimodalAnalysis) {
                  startMultimodalAnalysis();
                } else {
                  startSingleMediaAnalysis();
                }
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : result ? (
          <div className="min-h-[300px]">
            {multimodalAnalysis ? (
              <Tabs defaultValue="context" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="context" className="text-xs">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    Contexto
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="text-xs">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Análise
                  </TabsTrigger>
                  <TabsTrigger value="media" className="text-xs">
                    <Image className="h-3.5 w-3.5 mr-1" />
                    Mídia
                  </TabsTrigger>
                  <TabsTrigger value="action" className="text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Ação
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="context" className="p-1">
                  <div className="space-y-4">
                    {questionText && (
                      <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                        <p className="text-sm font-medium text-slate-700 mb-1">Pergunta:</p>
                        <p className="text-sm text-slate-600">"{questionText}"</p>
                      </div>
                    )}
                    
                    {responseValue !== undefined && responseValue !== null && (
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-slate-700 mr-2">Resposta:</p>
                        <Badge className={`${getResponseBadgeClass()}`} variant="outline">
                          {getResponseText()}
                        </Badge>
                      </div>
                    )}
                    
                    {mediaUrls && mediaUrls.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Mídias anexadas:</p>
                        <p className="text-sm text-slate-500">{mediaUrls.length} {mediaUrls.length === 1 ? "arquivo" : "arquivos"}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="analysis" className="p-1">
                  <div className="space-y-4">
                    {result.analysis && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm font-medium text-blue-700 mb-1">Análise do contexto:</p>
                        <p className="text-sm text-blue-600">{result.analysis}</p>
                      </div>
                    )}
                    
                    {result.hasNonConformity && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                          <p className="text-sm font-medium text-amber-700">Possível não conformidade detectada</p>
                        </div>
                        <p className="text-sm text-amber-600 mt-1">
                          A análise de IA identificou uma possível não conformidade com base na pergunta, resposta e mídias fornecidas.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="media" className="p-1">
                  <div className="space-y-4">
                    {result.imageAnalysis && (
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                        <div className="flex items-center mb-1">
                          <Image className="h-3.5 w-3.5 mr-1 text-purple-500" />
                          <p className="text-sm font-medium text-purple-700">Análise de imagens:</p>
                        </div>
                        <p className="text-sm text-purple-600">{result.imageAnalysis}</p>
                      </div>
                    )}
                    
                    {result.videoAnalysis && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
                        <div className="flex items-center mb-1">
                          <FileVideo className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                          <p className="text-sm font-medium text-indigo-700">Análise de vídeos:</p>
                        </div>
                        <p className="text-sm text-indigo-600">{result.videoAnalysis}</p>
                      </div>
                    )}
                    
                    {result.audioTranscription && (
                      <div className="bg-cyan-50 border border-cyan-200 rounded-md p-3">
                        <div className="flex items-center mb-1">
                          <Mic className="h-3.5 w-3.5 mr-1 text-cyan-500" />
                          <p className="text-sm font-medium text-cyan-700">Transcrição de áudio:</p>
                        </div>
                        <p className="text-sm text-cyan-600">{result.audioTranscription}</p>
                      </div>
                    )}
                    
                    {!result.imageAnalysis && !result.videoAnalysis && !result.audioTranscription && (
                      <p className="text-sm text-muted-foreground">Nenhuma mídia disponível para análise.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="action" className="p-1">
                  <div className="space-y-4">
                    {result.actionPlanSuggestion && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm font-medium text-green-700 mb-2">Sugestão de Plano de Ação:</p>
                        <p className="text-sm text-green-800 whitespace-pre-line">
                          {result.actionPlanSuggestion}
                        </p>
                      </div>
                    )}
                    
                    {!result.actionPlanSuggestion && (
                      <p className="text-sm text-muted-foreground">Nenhuma sugestão de plano de ação disponível.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="w-full">
                <div className="flex items-center mb-4">
                  <Check className="h-5 w-5 mr-2 text-green-500" />
                  <p className="font-medium">Análise completa</p>
                </div>
                
                {questionText && (
                  <div className="mb-4 bg-slate-50 border border-slate-200 rounded-md p-3">
                    <p className="text-sm font-medium text-slate-700">Contexto da pergunta:</p>
                    <p className="text-sm text-slate-600">"{questionText}"</p>
                  </div>
                )}
                
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
            )}
          </div>
        ) : (
          <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-sm text-muted-foreground">
              Análise automática iniciando...
            </p>
            {questionText && (
              <p className="text-xs text-muted-foreground mt-2">
                Analisará no contexto da pergunta: "{questionText}"
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {!isAnalyzing && !hasStarted && (
            <Button 
              onClick={multimodalAnalysis ? startMultimodalAnalysis : startSingleMediaAnalysis} 
              disabled={!multimodalAnalysis && !mediaUrl}
            >
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
