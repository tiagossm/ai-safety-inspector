
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MediaAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
  mediaUrls?: string[]; // Support for multiple URLs
  mediaType?: string | null;
  questionText?: string;
  onAnalysisComplete?: (result: MediaAnalysisResult) => void;
  multimodalAnalysis?: boolean;
}

export function MediaAnalysisDialog({
  open,
  onOpenChange,
  mediaUrl,
  mediaUrls = [], // Default empty array
  mediaType,
  questionText,
  onAnalysisComplete,
  multimodalAnalysis = false
}: MediaAnalysisDialogProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MediaAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('analysis');
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
      // Preparar URLs adicionais para análise multimodal
      const additionalUrls = mediaUrls
        .filter(url => url !== mediaUrl)
        .filter(url => !!url);
      
      console.log("MediaAnalysisDialog: Analisando com URLs adicionais:", additionalUrls.length);
      
      const analysisResult = await analyze({
        mediaUrl,
        mediaType,
        questionText,
        multimodalAnalysis: multimodalAnalysis || additionalUrls.length > 0,
        additionalMediaUrls: additionalUrls
      });
      
      setResult(analysisResult);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
      
      // Se houver uma sugestão de plano de ação, mudar para essa aba
      if (analysisResult.actionPlanSuggestion) {
        setActiveTab('action-plan');
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="analysis" className="flex-1">Análise</TabsTrigger>
            <TabsTrigger value="action-plan" className="flex-1">
              Plano de Ação
              {actionPlanSuggestion && <Sparkles className="h-3 w-3 ml-1" />}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="mt-4 space-y-4">
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
                <h4 className="font-medium mb-1">Análise Detalhada:</h4>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-line">
                  {analysis}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="action-plan" className="mt-4 space-y-4">
            {actionPlanSuggestion ? (
              <div>
                <h4 className="font-medium mb-1 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
                  <span>Sugestão de Plano de Ação:</span>
                </h4>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md whitespace-pre-line text-amber-800">
                  {actionPlanSuggestion}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>Nenhuma sugestão de plano de ação disponível.</p>
                {hasNonConformity && (
                  <p className="mt-2 text-sm text-amber-600">
                    Uma não conformidade foi detectada, mas a IA não gerou um plano de ação específico.
                    Considere criar um plano manualmente com base na análise.
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  const renderMediaThumbnails = () => {
    if (!mediaUrls || mediaUrls.length <= 1) return null;
    
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">
          {multimodalAnalysis ? "Analisando todas as imagens em conjunto:" : "Outras imagens relacionadas:"}
        </p>
        <div className="flex flex-wrap gap-2">
          {mediaUrls.map((url) => (
            <div 
              key={url} 
              className={`border rounded w-16 h-16 overflow-hidden ${url === mediaUrl ? 'ring-2 ring-primary' : ''}`}
            >
              <MediaRenderer url={url} className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Análise de Mídia{multimodalAnalysis ? " (Análise Múltipla)" : ""}</DialogTitle>
          <DialogDescription>
            {multimodalAnalysis 
              ? `Analisando ${mediaUrls.length} imagens em conjunto para uma avaliação completa`
              : "Visualize e analise o conteúdo desta mídia"}
          </DialogDescription>
        </DialogHeader>
        
        {mediaUrl && (
          <div>
            <div className="mb-4 max-h-[300px] overflow-hidden flex justify-center border rounded">
              <MediaRenderer url={mediaUrl} className="object-contain max-h-[300px] w-auto" />
            </div>
            
            {renderMediaThumbnails()}
            
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
                      {multimodalAnalysis || mediaUrls.length > 1 
                        ? `Analisar ${mediaUrls.length} imagens em conjunto` 
                        : "Analisar esta Mídia"}
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
