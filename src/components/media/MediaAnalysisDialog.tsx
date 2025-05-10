
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MediaRenderer } from "./MediaRenderer";
import { useMediaAnalysis, MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MediaAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
  mediaType?: string | null;
  questionText?: string;
  responseValue?: boolean | null;
  mediaUrls?: string[];
  onAnalysisComplete?: (result: MediaAnalysisResult) => void;
  multimodalAnalysis?: boolean;
}

export function MediaAnalysisDialog({
  open,
  onOpenChange,
  mediaUrl,
  mediaType,
  questionText = "",
  responseValue,
  mediaUrls = [],
  onAnalysisComplete,
  multimodalAnalysis = false
}: MediaAnalysisDialogProps) {
  const { analyze, analyzing, result, error } = useMediaAnalysis();
  const [activeTab, setActiveTab] = useState("overview");
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);

  // Reset state when the dialog opens/closes
  useEffect(() => {
    if (!open) {
      setHasStartedAnalysis(false);
      setActiveTab("overview");
    }
  }, [open]);

  // Automatically start multimodal analysis if requested
  useEffect(() => {
    if (open && multimodalAnalysis && !hasStartedAnalysis) {
      console.log("MediaAnalysisDialog: Starting multimodal analysis for question:", questionText);
      console.log("MediaAnalysisDialog: Response value:", responseValue);
      console.log("MediaAnalysisDialog: Media URLs:", mediaUrls);
      
      setHasStartedAnalysis(true);
      
      // Call the analyze function with multimodal parameters
      analyze({
        mediaUrl: null, 
        questionText, 
        responseValue,
        mediaUrls,
        multimodal: true
      }).then((analysisResult) => {
        console.log("MediaAnalysisDialog: Multimodal analysis complete:", analysisResult);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisResult);
        }
      }).catch(err => {
        console.error("MediaAnalysisDialog: Error in multimodal analysis:", err);
      });
    } else if (open && mediaUrl && !hasStartedAnalysis) {
      // Regular single media analysis
      console.log("MediaAnalysisDialog: Starting analysis for media:", mediaUrl);
      console.log("MediaAnalysisDialog: Question context:", questionText);
      
      setHasStartedAnalysis(true);
      
      analyze({
        mediaUrl,
        mediaType,
        questionText,
        multimodal: false
      }).then((analysisResult) => {
        console.log("MediaAnalysisDialog: Analysis complete:", analysisResult);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisResult);
        }
      }).catch(err => {
        console.error("MediaAnalysisDialog: Error in analysis:", err);
      });
    }
  }, [open, mediaUrl, mediaType, questionText, multimodalAnalysis, hasStartedAnalysis, analyze, responseValue, mediaUrls, onAnalysisComplete]);

  const handleStartAnalysis = async () => {
    if (mediaUrl) {
      console.log("MediaAnalysisDialog: Manually starting analysis for:", mediaUrl);
      
      setHasStartedAnalysis(true);
      
      try {
        const analysisResult = await analyze({
          mediaUrl,
          mediaType,
          questionText,
          multimodal: false
        });
        
        console.log("MediaAnalysisDialog: Analysis complete:", analysisResult);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisResult);
        }
      } catch (err) {
        console.error("MediaAnalysisDialog: Error in analysis:", err);
      }
    } else if (multimodalAnalysis) {
      console.log("MediaAnalysisDialog: Manually starting multimodal analysis");
      
      setHasStartedAnalysis(true);
      
      try {
        const analysisResult = await analyze({
          mediaUrl: null,
          questionText,
          responseValue,
          mediaUrls,
          multimodal: true
        });
        
        console.log("MediaAnalysisDialog: Multimodal analysis complete:", analysisResult);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisResult);
        }
      } catch (err) {
        console.error("MediaAnalysisDialog: Error in multimodal analysis:", err);
      }
    }
  };

  // Function to render the action plan section
  const renderActionPlan = () => {
    if (!result?.actionPlanSuggestion) {
      return (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            Nenhuma sugestão de plano de ação disponível.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium">Sugestão de Plano de Ação:</h4>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="whitespace-pre-line text-sm text-amber-800">{result.actionPlanSuggestion}</p>
        </div>
      </div>
    );
  };

  // Function to render the question context section
  const renderQuestionContext = () => {
    return (
      <div className="mb-6 border-b pb-4">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-700">Contexto da Pergunta:</h3>
          <p className="mt-1 text-sm">{questionText || "Sem contexto disponível"}</p>
        </div>
        
        {responseValue !== undefined && responseValue !== null && (
          <div className="mt-3 flex items-center">
            <h3 className="text-sm font-medium text-gray-700 mr-2">Resposta:</h3>
            {responseValue === true ? (
              <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1" variant="outline">
                <ThumbsUp className="h-3 w-3" />
                <span>Sim (OK)</span>
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1" variant="outline">
                <ThumbsDown className="h-3 w-3" />
                <span>Não</span>
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  };

  // Function to render the media preview
  const renderMediaPreview = () => {
    if (mediaUrl) {
      return (
        <div className="mb-6 max-h-96 overflow-hidden rounded-lg border bg-slate-50 flex justify-center">
          <MediaRenderer url={mediaUrl} />
        </div>
      );
    } else if (mediaUrls && mediaUrls.length > 0) {
      return (
        <div className="mb-6 grid grid-cols-2 gap-2">
          {mediaUrls.slice(0, 4).map((url, index) => (
            <div key={index} className="rounded-lg border overflow-hidden h-24 bg-slate-50">
              <MediaRenderer url={url} />
            </div>
          ))}
          {mediaUrls.length > 4 && (
            <div className="col-span-2 text-center text-sm text-gray-500 mt-1">
              +{mediaUrls.length - 4} arquivos adicionais
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  // Function to render analysis results for different media types
  const renderAnalysisResults = () => {
    if (!result) {
      return (
        <div className="text-center py-10">
          <p className="text-sm text-gray-500">Análise ainda não disponível.</p>
        </div>
      );
    }

    return (
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Geral</TabsTrigger>
          <TabsTrigger value="image" disabled={!result.imageAnalysis}>Imagem</TabsTrigger>
          <TabsTrigger value="audio" disabled={!result.audioTranscription}>Áudio</TabsTrigger>
          <TabsTrigger value="action">Plano</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <div className="space-y-4">
            {result.summary && (
              <>
                <h4 className="font-medium">Resumo da Análise:</h4>
                <p className="text-sm">{result.summary}</p>
              </>
            )}
            
            {result.hasNonConformity !== undefined && (
              <div className="flex items-center mt-4">
                <div className="mr-3">
                  {result.hasNonConformity ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {result.hasNonConformity 
                      ? "Possível não conformidade detectada" 
                      : "Nenhuma não conformidade detectada"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {result.hasNonConformity 
                      ? "Recomendamos verificar o plano de ação sugerido" 
                      : "Este item parece estar em conformidade"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="pt-4">
          <div className="space-y-4">
            <h4 className="font-medium">Análise da Imagem:</h4>
            <p className="text-sm whitespace-pre-line">{result.imageAnalysis}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="audio" className="pt-4">
          <div className="space-y-4">
            <h4 className="font-medium">Transcrição de Áudio:</h4>
            <p className="text-sm whitespace-pre-line">{result.audioTranscription}</p>
            
            {result.audioSentiment && (
              <>
                <h4 className="font-medium mt-4">Sentimento:</h4>
                <p className="text-sm">{result.audioSentiment}</p>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="action" className="pt-4">
          {renderActionPlan()}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {multimodalAnalysis 
              ? "Análise Multimodal com IA" 
              : "Análise de Mídia com IA"}
          </DialogTitle>
          <DialogDescription>
            {multimodalAnalysis
              ? "Analisando o contexto da questão, resposta e todas as mídias anexadas"
              : "Analisando a mídia selecionada no contexto da questão"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-[60vh] pr-4">
            {/* Question context section */}
            {renderQuestionContext()}
            
            {/* Media preview section */}
            {renderMediaPreview()}
            
            {/* Analysis status and results */}
            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-gray-500">Analisando com IA...</p>
                <p className="text-xs text-gray-400 mt-1">Isso pode levar alguns segundos</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600 font-medium">Erro na análise</p>
                <p className="text-xs text-gray-500 mt-1">{error.message || "Falha ao processar a análise"}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={handleStartAnalysis}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : (
              renderAnalysisResults()
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter className="flex justify-end items-center pt-2 gap-2">
          {result && (
            <div className="flex-grow text-left">
              {result.hasNonConformity && (
                <Badge className="bg-amber-100 text-amber-800" variant="outline">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Possível não conformidade
                </Badge>
              )}
            </div>
          )}
          
          {!analyzing && !hasStartedAnalysis && (
            <Button 
              onClick={handleStartAnalysis}
              className="mr-2"
            >
              Iniciar Análise
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
