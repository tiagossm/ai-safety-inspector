
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
import { MediaRenderer } from "@/components/media/MediaRenderer";
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
  const [analysisResult, setAnalysisResult] = useState<MediaAnalysisResult | null>(null);

  // Reset state when the dialog opens/closes
  useEffect(() => {
    if (!open) {
      setHasStartedAnalysis(false);
      setActiveTab("overview");
      setAnalysisResult(null);
    }
  }, [open]);

  // Automatically start multimodal analysis if requested
  useEffect(() => {
    if (open && !hasStartedAnalysis) {
      console.log("MediaAnalysisDialog: Starting analysis with parameters:", {
        multimodalAnalysis,
        mediaUrl,
        responseValue,
        mediaUrls: mediaUrls?.length
      });
      
      setHasStartedAnalysis(true);
      
      // Call the analyze function with appropriate parameters
      analyze({
        mediaUrl: multimodalAnalysis ? null : mediaUrl, 
        mediaType: multimodalAnalysis ? null : mediaType,
        questionText, 
        responseValue,
        mediaUrls: multimodalAnalysis ? mediaUrls : undefined,
        multimodal: multimodalAnalysis
      }).then((result) => {
        console.log("MediaAnalysisDialog: Analysis complete:", result);
        setAnalysisResult(result);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
      }).catch(err => {
        console.error("MediaAnalysisDialog: Error in analysis:", err);
      });
    }
  }, [open, mediaUrl, mediaType, questionText, multimodalAnalysis, hasStartedAnalysis, analyze, responseValue, mediaUrls, onAnalysisComplete]);

  const handleStartAnalysis = async () => {
    console.log("MediaAnalysisDialog: Manually starting analysis");
    setHasStartedAnalysis(true);
    
    try {
      const result = await analyze({
        mediaUrl: multimodalAnalysis ? null : mediaUrl,
        mediaType: multimodalAnalysis ? null : mediaType,
        questionText,
        responseValue,
        mediaUrls: multimodalAnalysis ? mediaUrls : undefined,
        multimodal: multimodalAnalysis
      });
      
      console.log("MediaAnalysisDialog: Analysis complete:", result);
      setAnalysisResult(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error("MediaAnalysisDialog: Error in analysis:", err);
    }
  };

  // Function to render the action plan section
  const renderActionPlan = () => {
    const suggestion = analysisResult?.actionPlanSuggestion || result?.actionPlanSuggestion;
    
    if (!suggestion) {
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
          <p className="whitespace-pre-line text-sm text-amber-800">{suggestion}</p>
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
    if (mediaUrl && !multimodalAnalysis) {
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
              +{mediaUrls.length - 4} mídia(s) adicionais
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  // Determine if we have any analysis results to show
  const hasAnalysisResults = analysisResult !== null || result !== null;
  const displayedResult = analysisResult || result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Análise de {multimodalAnalysis ? "Inspeção" : "Mídia"} com IA</DialogTitle>
          <DialogDescription>
            {multimodalAnalysis 
              ? "Análise inteligente dos dados da inspeção e mídias associadas" 
              : "Análise inteligente do conteúdo da mídia"}
          </DialogDescription>
        </DialogHeader>

        {renderQuestionContext()}
        {renderMediaPreview()}

        {analyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium">Analisando...</h3>
            <p className="text-muted-foreground mt-2 text-sm text-center max-w-md">
              Nossa IA está processando os dados e gerando insights. Isto pode levar alguns segundos.
            </p>
          </div>
        ) : hasAnalysisResults ? (
          <ScrollArea className="flex-1 overflow-auto pr-4">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="action-plan">Plano de Ação</TabsTrigger>
                {displayedResult?.imageAnalysis && <TabsTrigger value="image">Imagens</TabsTrigger>}
                {displayedResult?.audioTranscription && <TabsTrigger value="audio">Áudio</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {displayedResult?.hasNonConformity === true ? (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1">Não conformidade detectada</h4>
                      <p className="text-amber-700 text-sm">
                        A análise de IA identificou potenciais problemas que necessitam de atenção.
                      </p>
                    </div>
                  </div>
                ) : displayedResult?.hasNonConformity === false ? (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">Em conformidade</h4>
                      <p className="text-green-700 text-sm">
                        A análise de IA não identificou problemas significativos.
                      </p>
                    </div>
                  </div>
                ) : null}

                {displayedResult?.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Resumo da Análise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{displayedResult.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {displayedResult?.analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Detalhes da Análise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{displayedResult.analysis}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="action-plan">
                {renderActionPlan()}
              </TabsContent>
              
              {displayedResult?.imageAnalysis && (
                <TabsContent value="image">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Análise de Imagem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{displayedResult.imageAnalysis}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              {displayedResult?.audioTranscription && (
                <TabsContent value="audio">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Transcrição de Áudio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line">{displayedResult.audioTranscription}</p>
                      
                      {displayedResult?.audioSentiment && (
                        <div className="mt-4">
                          <h4 className="font-medium text-sm mb-1">Sentimento:</h4>
                          <p>{displayedResult.audioSentiment}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </ScrollArea>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-700">Erro na análise</h3>
            <p className="text-red-600 mt-2 max-w-md mx-auto">
              {error.message || "Ocorreu um erro ao analisar a mídia. Por favor, tente novamente."}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Clique no botão abaixo para iniciar a análise.
            </p>
          </div>
        )}

        <DialogFooter>
          {!hasStartedAnalysis && (
            <Button 
              onClick={handleStartAnalysis} 
              disabled={analyzing}
              className="w-full sm:w-auto"
            >
              {analyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Análise
            </Button>
          )}
          
          {hasAnalysisResults && (
            <Button 
              variant="outline" 
              onClick={() => {
                setHasStartedAnalysis(false);
                setAnalysisResult(null);
              }}
              className="w-full sm:w-auto"
            >
              Nova Análise
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
