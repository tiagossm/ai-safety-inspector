import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMediaAnalysis, MediaAnalysisResult, Plan5W2H } from '@/hooks/useMediaAnalysis';
import { Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from "react-markdown";

interface MediaAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
  mediaType?: string | null;
  questionText?: string;
  userAnswer?: string;
  onAnalysisComplete?: (url: string, result: MediaAnalysisResult) => void;
  onAdd5W2HActionPlan?: (plan: Plan5W2H) => void;
  onAddComment?: (comment: string) => void;
  multimodalAnalysis?: boolean;
  mediaUrls?: string[];
  additionalMediaUrls?: string[];
}

type Status = 'idle' | 'analyzing' | 'done' | 'error';

type AnalysisState = {
  status: Status;
  result?: MediaAnalysisResult;
  errorMessage?: string;
  analyzed?: boolean;
};

export function MediaAnalysisDialog({
  open,
  onOpenChange,
  mediaUrl,
  mediaType,
  questionText = "",
  userAnswer = "",
  onAnalysisComplete,
  onAdd5W2HActionPlan,
  onAddComment,
  multimodalAnalysis = false,
  mediaUrls = [],
  additionalMediaUrls = []
}: MediaAnalysisDialogProps) {
  const MAX_IMAGES = 4;

  const allImages: string[] = useMemo(() => {
    if (!mediaUrl) return [];
    // Mantém fluxo para images, mas serve como base de comparação
    const sourceImages = mediaUrls.length > 0 ? mediaUrls : (additionalMediaUrls || []);
    const otherImages = sourceImages.filter(url => url !== mediaUrl);

    return [mediaUrl, ...otherImages].slice(0, MAX_IMAGES);
  }, [mediaUrl, mediaUrls, additionalMediaUrls]);

  const isAudio = (mediaType === "audio") || (mediaUrl && /\.(mp3|wav|ogg|m4a|webm)$/i.test(mediaUrl));
   
  const [analysisMap, setAnalysisMap] = useState<Record<string, AnalysisState>>({});
  const { analyze } = useMediaAnalysis();

  const allImagesStringified = useMemo(() => JSON.stringify(allImages), [allImages]);

  useEffect(() => {
    if (open) {
      const currentImages = JSON.parse(allImagesStringified) as string[];
      setAnalysisMap(prev => {
        const newMap: Record<string, AnalysisState> = {};
        currentImages.forEach(url => {
          newMap[url] = prev[url] || { status: 'idle', analyzed: false };
        });
        return newMap;
      });
    } else if (!open) {
      setAnalysisMap({});
    }
  }, [open, allImagesStringified]);

  // Fluxo para análise de imagem e áudio
  const analyzeMedia = useCallback(async (url: string, mediaType: string) => {
    if (!url) return;

    setAnalysisMap(prev => ({
      ...prev,
      [url]: { ...prev[url], status: 'analyzing' }
    }));

    try {
      const contextImages = allImages.filter(u => u !== url);
      const result = await analyze({
        mediaUrl: url,
        mediaType,
        questionText,
        userAnswer,
        multimodalAnalysis: false,
        additionalMediaUrls: contextImages
      });

      if (result) {
        setAnalysisMap(prev => ({
          ...prev,
          [url]: { status: 'done', result, analyzed: true }
        }));

        onAnalysisComplete?.(url, result);
      } else {
        throw new Error('Nenhum resultado retornado da análise');
      }
    } catch (error: any) {
      setAnalysisMap(prev => ({
        ...prev,
        [url]: {
          status: 'error',
          errorMessage: `Erro ao analisar: ${error.message}`,
          analyzed: false
        }
      }));
    }
  }, [analyze, allImages, mediaType, questionText, userAnswer, onAnalysisComplete]);

  const renderMarkdown = (md: string) =>
    <ReactMarkdown
      components={{
        strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
        p: ({node, ...props}) => <p className="mb-2" {...props} />
      }}
    >{md}</ReactMarkdown>;
  const showMaxWarning = (mediaUrls.length > MAX_IMAGES || additionalMediaUrls.length > MAX_IMAGES);

  // Áudio: exibe player e transcrição/análise
  if (isAudio && mediaUrl) {
    const state = analysisMap[mediaUrl] || { status: 'idle', analyzed: false };
    const result = state.result;
    const plan5w2h = result?.plan5w2h;
    const has5w2h = !!plan5w2h && Object.values(plan5w2h).some(v => v && String(v).trim() !== "");
    const hasNonConformity = result?.hasNonConformity === true;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              Análise de Áudio com IA
            </DialogTitle>
          </DialogHeader>

          <div className="mb-4 border rounded p-3 bg-gray-50">
            <audio controls src={mediaUrl} className="w-full my-2" />
            <p className="text-xs text-gray-500">Áudio para análise</p>
          </div>

          {(state.status === 'idle' && !state.analyzed) && (
            <Button
              size="sm"
              onClick={() => analyzeMedia(mediaUrl, "audio")}
              className="mb-2 w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Analisar com IA
            </Button>
          )}

          {state.status === 'analyzing' && (
            <div className="flex flex-col items-center mt-3 mb-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs mt-1 text-gray-600">Analisando...</span>
            </div>
          )}

          {state.status === 'error' && (
            <div className="w-full border rounded-md p-2 bg-red-50 border-red-200 mt-1 mb-2">
              <div className="text-xs text-red-700 mb-2">{state.errorMessage}</div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => analyzeMedia(mediaUrl, "audio")}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {state.status === 'done' && result && (
            <>
              {hasNonConformity && has5w2h && (
                <div className="w-full my-2 p-2 rounded-md border text-center bg-amber-50 border-amber-200">
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-medium text-amber-800">
                      Plano de ação sugerido
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-2 border rounded p-2 bg-gray-50">
                <h3 className="text-xs font-medium text-gray-700 mb-1">Transcrição do Áudio:</h3>
                <div className="text-xs whitespace-pre-line text-gray-900">
                  {result.transcript ?? <span className="italic text-gray-400">Sem transcrição</span>}
                </div>
              </div>

              <div className="w-full border rounded-md p-2 bg-gray-50 mb-1">
                <h3 className="text-xs font-medium text-gray-700 mb-1">Análise da IA:</h3>
                <div className="text-xs whitespace-pre-line">
                  {renderMarkdown(result.analysis ?? "Nenhuma análise disponível.")}
                </div>
              </div>

              {hasNonConformity && has5w2h && onAdd5W2HActionPlan && plan5w2h ? (
                <div className="w-full border rounded-md p-2 bg-amber-50 border-amber-200 mt-1">
                  <div className="flex items-center mb-1">
                    <Sparkles className="h-3 w-3 text-amber-500 mr-1" />
                    <h3 className="text-xs font-medium text-amber-800">Sugestão (5W2H):</h3>
                  </div>
                  <div className="text-xs text-amber-700 space-y-1">
                    {plan5w2h.what && <p><strong>O quê:</strong> {plan5w2h.what}</p>}
                    {plan5w2h.why && <p><strong>Porquê:</strong> {plan5w2h.why}</p>}
                    {plan5w2h.who && <p><strong>Quem:</strong> {plan5w2h.who}</p>}
                    {plan5w2h.where && <p><strong>Onde:</strong> {plan5w2h.where}</p>}
                    {plan5w2h.how && <p><strong>Como:</strong> {plan5w2h.how}</p>}
                    {plan5w2h.howMuch && <p><strong>Quanto:</strong> {plan5w2h.howMuch}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    className="mt-2 w-full bg-amber-500 hover:bg-amber-600"
                    onClick={() => {
                      onAdd5W2HActionPlan(plan5w2h);
                      onOpenChange(false);
                    }}
                  >
                    Usar Sugestão 5W2H
                  </Button>
                </div>
              ) : (
                <div className="w-full mt-2 text-center text-xs p-2 rounded-md bg-green-50 text-green-800 border border-green-200">
                  {result.analysis ? "Análise concluída. Nenhuma ação sugerida." : "Análise concluída."}
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ---- Fluxo original para imagens e outros tipos
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Análise de Imagens com IA
          </DialogTitle>
        </DialogHeader>

        {showMaxWarning && (
          <div className="mb-3 bg-yellow-100 text-yellow-900 text-xs rounded px-3 py-2 border border-yellow-300">
            Atenção: apenas as 4 primeiras imagens serão analisadas.
          </div>
        )}

        {questionText && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md border">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Contexto da Questão:</h3>
            <p className="text-sm text-gray-600 mb-1">{questionText}</p>
            {userAnswer && (
              <>
                <h4 className="text-xs font-medium text-gray-600 mt-2">Resposta do Usuário:</h4>
                <p className="text-xs text-gray-700">{userAnswer}</p>
              </>
            )}
          </div>
        )}

        {allImages.length > 0 && (
          <div className={`grid gap-4 ${allImages.length > 1 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : ''}`}>
            {allImages.map((url, idx) => {
              const state = analysisMap[url] || { status: 'idle', analyzed: false };
              const result = state.result;
              const plan5w2h = result?.plan5w2h;
              const has5w2h = !!plan5w2h && Object.values(plan5w2h).some(v => v && String(v).trim() !== "");
              const hasNonConformity = result?.hasNonConformity === true;

              return (
                <div key={url} className="col-span-1 border rounded-lg shadow-sm p-2 bg-white flex flex-col items-center">
                  <img
                    src={url}
                    alt={idx === 0 ? "Imagem principal" : `Imagem adicional ${idx}`}
                    className={`w-full max-h-52 object-contain rounded-md border ${idx === 0 ? 'border-green-300' : 'border-gray-200'}`}
                  />
                  <p className="text-xs text-center mt-1 text-gray-500">
                    {idx === 0 ? 'Imagem principal' : `Imagem adicional ${idx}`}
                  </p>
                  {state.status === 'idle' && !state.analyzed && (
                    <Button
                      size="sm"
                      onClick={() => analyzeMedia(url, "image")}
                      className="mt-2 w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analisar com IA
                    </Button>
                  )}
                  {state.status === 'analyzing' && (
                    <div className="flex flex-col items-center mt-3 mb-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs mt-1 text-gray-600">Analisando...</span>
                    </div>
                  )}
                  {state.status === 'error' && (
                    <div className="w-full border rounded-md p-2 bg-red-50 border-red-200 mt-1">
                      <div className="text-xs text-red-700 mb-2">{state.errorMessage}</div>
                      <Button size="sm" variant="secondary" onClick={() => analyzeMedia(url, "image")}>
                        Tentar novamente
                      </Button>
                    </div>
                  )}
                  {state.status === 'done' && result && (
                    <>
                      {hasNonConformity && has5w2h && (
                        <div className="w-full my-2 p-2 rounded-md border text-center bg-amber-50 border-amber-200">
                          <div className="flex items-center justify-center gap-1">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-medium text-amber-800">
                              Plano de ação sugerido
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="w-full border rounded-md p-2 bg-gray-50 mb-1">
                        <h3 className="text-xs font-medium text-gray-700 mb-1">Análise da IA:</h3>
                        <div className="text-xs whitespace-pre-line">
                          {renderMarkdown(result.analysis ?? "Nenhuma análise disponível.")}
                        </div>
                      </div>
                      {hasNonConformity && has5w2h && onAdd5W2HActionPlan && plan5w2h ? (
                        <div className="w-full border rounded-md p-2 bg-amber-50 border-amber-200 mt-1">
                          <div className="flex items-center mb-1">
                            <Sparkles className="h-3 w-3 text-amber-500 mr-1" />
                            <h3 className="text-xs font-medium text-amber-800">Sugestão (5W2H):</h3>
                          </div>
                          <div className="text-xs text-amber-700 space-y-1">
                            {plan5w2h.what && <p><strong>O quê:</strong> {plan5w2h.what}</p>}
                            {plan5w2h.why && <p><strong>Porquê:</strong> {plan5w2h.why}</p>}
                            {plan5w2h.who && <p><strong>Quem:</strong> {plan5w2h.who}</p>}
                            {plan5w2h.where && <p><strong>Onde:</strong> {plan5w2h.where}</p>}
                            {plan5w2h.how && <p><strong>Como:</strong> {plan5w2h.how}</p>}
                            {plan5w2h.howMuch && <p><strong>Quanto:</strong> {plan5w2h.howMuch}</p>}
                          </div>
                          <Button
                            size="sm"
                            variant="default"
                            className="mt-2 w-full bg-amber-500 hover:bg-amber-600"
                            onClick={() => {
                              onAdd5W2HActionPlan(plan5w2h);
                              onOpenChange(false);
                            }}
                          >
                            Usar Sugestão 5W2H
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full mt-2 text-center text-xs p-2 rounded-md bg-green-50 text-green-800 border border-green-200">
                          {result.analysis ? "Análise concluída. Nenhuma ação sugerida." : "Análise concluída."}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
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
