import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMediaAnalysis, MediaAnalysisResult } from '@/hooks/useMediaAnalysis';
import { Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from "react-markdown";

interface MediaAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
  mediaType?: string | null;
  questionText?: string;
  userAnswer?: string;
  onAnalysisComplete?: (result: MediaAnalysisResult) => void;
  onAddActionPlan?: (suggestion: string) => void;
  onAddComment?: (comment: string) => void;
  multimodalAnalysis?: boolean;
  mediaUrls?: string[];
  additionalMediaUrls?: string[];
}

type Status = 'pending' | 'processing' | 'done' | 'error' | 'retry';

type AnalysisState = {
  status: Status;
  result?: MediaAnalysisResult;
  errorMessage?: string;
};

// Função para garantir que cada linha vira um item de lista markdown
function forceListMarkdown(text: string): string {
  return text
    .split('\n')
    .map(line => {
      if (/^(\s*-|\s*\d+\.)/.test(line) || line.trim() === "") return line;
      if (/sugeridas?:/i.test(line)) return `**${line.trim()}**`;
      return `- ${line.trim()}`;
    })
    .join('\n');
}

// Fallback para extrair ações corretivas do texto da análise
function getSafeActionPlan(result: MediaAnalysisResult): string {
  const isInvalid = !result.actionPlanSuggestion 
    || result.actionPlanSuggestion.trim() === "" 
    || result.actionPlanSuggestion.trim().toLowerCase() === "sugeridas:**";

  if (!isInvalid) return result.actionPlanSuggestion!;
  
  if (result.analysis) {
    const regex = /Ações? [Cc]orretivas [Ss]ugeridas?:([\s\S]+?)(?:\n\S|\n\n|Conclusão:|$)/i;
    const match = result.analysis.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return "";
}

export function MediaAnalysisDialog({
  open,
  onOpenChange,
  mediaUrl,
  mediaType,
  questionText = "",
  userAnswer = "",
  onAnalysisComplete,
  onAddActionPlan,
  onAddComment,
  multimodalAnalysis = false,
  mediaUrls = [],
  additionalMediaUrls = []
}: MediaAnalysisDialogProps) {
  const MAX_IMAGES = 4;
  const allImages: string[] = React.useMemo(() => {
    if (!mediaUrl) return [];
    const base = mediaUrls.length > 0 ? mediaUrls : additionalMediaUrls;
    const filtered = base.filter(url => url !== mediaUrl);
    return [mediaUrl, ...filtered].slice(0, MAX_IMAGES);
  }, [mediaUrl, mediaUrls, additionalMediaUrls]);

  const [analysisMap, setAnalysisMap] = useState<Record<string, AnalysisState>>({});
  const { analyze } = useMediaAnalysis();

  // Ref para controlar urls já em análise e evitar loop
  const analyzedUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      let map: Record<string, AnalysisState> = {};
      allImages.forEach(url => {
        map[url] = { status: 'pending' };
      });
      setAnalysisMap(map);
      analyzedUrlsRef.current.clear();
    } else {
      setAnalysisMap({});
      analyzedUrlsRef.current.clear();
    }
  }, [open, allImages]);

  useEffect(() => {
    if (!open) return;

    allImages.forEach(url => {
      const state = analysisMap[url];

      // Evita re-analisar urls já em processamento ou finalizadas
      if (analyzedUrlsRef.current.has(url)) return;

      if (!state || state.status === 'pending' || state.status === 'retry') {
        setAnalysisMap(prev => ({
          ...prev,
          [url]: { ...prev[url], status: 'processing' }
        }));

        analyzedUrlsRef.current.add(url);

        const contextImages = allImages.filter(u => u !== url);

        analyze({
          mediaUrl: url,
          mediaType,
          questionText,
          userAnswer,
          multimodalAnalysis: false,
          additionalMediaUrls: contextImages
        })
        .then(result => {
          setAnalysisMap(prev => ({
            ...prev,
            [url]: { status: 'done', result }
          }));
          if (onAnalysisComplete) onAnalysisComplete(result);
        })
        .catch(err => {
          setAnalysisMap(prev => ({
            ...prev,
            [url]: { status: 'error', errorMessage: `Erro ao analisar imagem: ${err.message}` }
          }));
          analyzedUrlsRef.current.delete(url); // Permite retry depois de erro
        });
      }
    });
  }, [open, analyze, mediaUrl, mediaType, questionText, userAnswer, allImages, onAnalysisComplete]);

  const handleRetry = (url: string) => {
    analyzedUrlsRef.current.delete(url);
    setAnalysisMap(prev => ({
      ...prev,
      [url]: { status: 'retry' }
    }));
  };

  const isLoading = Object.values(analysisMap).some(state => state?.status === 'processing');

  const renderMarkdown = (md: string) =>
    <ReactMarkdown
      components={{
        strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
        p: ({node, ...props}) => <p className="mb-2" {...props} />
      }}
    >{md}</ReactMarkdown>;

  const showMaxWarning = (mediaUrls.length > MAX_IMAGES || additionalMediaUrls.length > MAX_IMAGES);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Análise Individualizada das Imagens
          </DialogTitle>
        </DialogHeader>

        {showMaxWarning && (
          <div className="mb-3 bg-yellow-100 text-yellow-900 text-xs rounded px-3 py-2 border border-yellow-300">
            Atenção: apenas as 4 primeiras imagens foram analisadas. As demais não serão processadas.
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

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-gray-600">Analisando imagens...</p>
          </div>
        )}

        {allImages.length > 0 && (
          <div className={`grid gap-4 ${allImages.length > 1 ? 'grid-cols-2 sm:grid-cols-4' : ''}`}>
            {allImages.map((url, idx) => {
              const state = analysisMap[url];
              const result = state?.result;
              const actionSuggestion = result ? getSafeActionPlan(result) : "";
              const hasActionSuggestion = !!actionSuggestion && actionSuggestion.trim().length > 0;

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
                  {state?.status === 'processing' && (
                    <div className="flex flex-col items-center mt-3 mb-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs mt-1 text-gray-600">Analisando...</span>
                    </div>
                  )}
                  {state?.status === 'error' && (
                    <div className="w-full border rounded-md p-2 bg-red-50 border-red-200 mt-1">
                      <div className="text-xs text-red-700 mb-2">{state.errorMessage}</div>
                      <Button size="sm" variant="secondary" onClick={() => handleRetry(url)}>Tentar novamente</Button>
                    </div>
                  )}
                  {state?.status === 'done' && result && (
                    <>
                      {hasActionSuggestion && (
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
                        <h3 className="text-xs font-medium text-gray-700 mb-1">Análise da Imagem:</h3>
                        <div className="text-xs whitespace-pre-line">
                          {renderMarkdown(result.analysis ?? "")}
                        </div>
                      </div>
                      {hasActionSuggestion && (
                        <div className="w-full border rounded-md p-2 bg-amber-50 border-amber-200 mt-1">
                          <div className="flex items-center mb-1">
                            <Sparkles className="h-3 w-3 text-amber-500 mr-1" />
                            <h3 className="text-xs font-medium text-amber-800">Ações Corretivas Sugeridas:</h3>
                          </div>
                          <div className="text-xs text-amber-700">
                            {renderMarkdown(actionSuggestion)}
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="mt-2 w-full"
                            onClick={() => {
                              onAddActionPlan?.(actionSuggestion);
                            }}
                          >
                            Adicionar ao Plano de Ação
                          </Button>
                        </div>
                      )}
                      {!hasActionSuggestion && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-2 w-full"
                          onClick={() => onAddComment?.("Situação em conformidade conforme análise IA.")}
                        >
                          Adicionar comentário de conformidade
                        </Button>
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
