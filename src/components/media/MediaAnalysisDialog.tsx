
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
import { MediaCheckboxGrid } from "./MediaCheckboxGrid";

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
  // Estado local para controlar os arquivos da timeline
  const [allFiles, setAllFiles] = useState<string[]>([]);
  
  // Tipo principal: se todos selecionados forem do mesmo tipo, identifica (mesma lógica)
  const guessPrincipalType = (files: string[]) => {
    if (!files.length) return undefined;
    const exts = files.map(url => (url.split('.').pop() || "").toLowerCase());
    if (exts.find(e => ['mp3','wav','ogg','m4a','webm'].includes(e))) return "audio";
    if (exts.find(e => ['mp4','webm','mov','avi'].includes(e))) return "video";
    if (exts.find(e => ['jpg','jpeg','png','webp','gif','bmp'].includes(e))) return "image";
    if (exts.find(e => e === "pdf")) return "pdf";
    return undefined;
  };

  // Estado dos selecionados
  const [selected, setSelected] = useState<string[]>([]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({ status: 'idle', analyzed: false });
  const { analyze } = useMediaAnalysis();

  // Sempre resetar seleção e lista de arquivos quando abrir ou mudar arquivos
  useEffect(() => {
    if (open) {
      // Monta timeline única a partir das props
      const filesInitial = Array.from(new Set([...(mediaUrls || []), ...(additionalMediaUrls || []), ...(mediaUrl ? [mediaUrl] : [])]));
      setAllFiles(filesInitial);
      setAnalysisState({ status: 'idle', analyzed: false });
      setSelected(filesInitial); // Seleciona todos por padrão
    }
  }, [open, mediaUrl, JSON.stringify(mediaUrls), JSON.stringify(additionalMediaUrls)]);

  // Alterna seleção individual
  const toggleSelection = (url: string) => {
    setSelected(sel => 
      sel.includes(url) ? sel.filter(u => u !== url) : sel.concat(url)
    );
  };

  // Novo: remover arquivo da timeline (estado local)
  const handleDeleteFile = (url: string) => {
    setAllFiles(files => files.filter(u => u !== url));
    setSelected(sel => sel.filter(u => u !== url));
  };

  // Handler análise (usa somente os selecionados)
  const handleAnalyzeConsolidated = useCallback(async () => {
    if (selected.length === 0) return; // Não permite analisar nada
    setAnalysisState({ status: 'analyzing', analyzed: false });
    try {
      const result = await analyze({
        mediaUrl: selected[0],
        questionText,
        userAnswer,
        multimodalAnalysis: selected.length > 1,
        additionalMediaUrls: selected.slice(1),
        mediaType: guessPrincipalType(selected)
      });

      if (result) {
        setAnalysisState({ status: 'done', result, analyzed: true });
        onAnalysisComplete?.(selected.join(','), result);
      } else {
        throw new Error('Nenhum resultado retornado da análise');
      }
    } catch (err: any) {
      setAnalysisState({
        status: 'error',
        errorMessage: `Erro ao analisar: ${err?.message}`,
        analyzed: false
      });
    }
  }, [analyze, selected, questionText, userAnswer, onAnalysisComplete]);

  // Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Análise Consolidada com IA ({allFiles.length} mídias)
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="text-xs text-gray-800 font-medium mb-1">
            Selecione as mídias para incluir na análise:
          </div>
          <MediaCheckboxGrid
            files={allFiles}
            selected={selected}
            onToggle={toggleSelection}
            disabled={analysisState.status === "analyzing"}
            onDeleteFile={handleDeleteFile}
          />
          {selected.length === 0 && (
            <div className="text-xs text-red-600 mt-2">Selecione pelo menos uma mídia.</div>
          )}
        </div>

        {analysisState.status === 'idle' && !analysisState.analyzed && (
          <Button 
            size="sm"
            onClick={handleAnalyzeConsolidated}
            className="mb-2 w-full"
            disabled={selected.length === 0}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Analisar mídias selecionadas com IA
          </Button>
        )}

        {analysisState.status === 'analyzing' && (
          <div className="flex flex-col items-center mt-3 mb-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs mt-1 text-gray-600">Analisando mídias selecionadas...</span>
          </div>
        )}

        {analysisState.status === 'error' && (
          <div className="w-full border rounded-md p-2 bg-red-50 border-red-200 mt-1 mb-2">
            <div className="text-xs text-red-700 mb-2">{analysisState.errorMessage}</div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAnalyzeConsolidated}
              disabled={selected.length === 0}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {analysisState.status === 'done' && analysisState.result && (
          <>
            <div className="w-full border rounded-md p-2 bg-gray-50 mb-2">
              <h3 className="text-xs font-medium text-gray-700 mb-1">Análise da IA (consolidada):</h3>
              <div className="text-xs whitespace-pre-line">
                <ReactMarkdown
                  components={{
                    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2" {...props} />
                  }}
                >{analysisState.result.analysis ?? "Nenhuma análise disponível."}</ReactMarkdown>
              </div>
            </div>
            {analysisState.result.hasNonConformity && analysisState.result.plan5w2h && Object.values(analysisState.result.plan5w2h).some(Boolean) && (
              <div className="w-full border rounded-md p-2 bg-amber-50 border-amber-200 mt-1">
                <div className="flex items-center mb-1">
                  <Sparkles className="h-3 w-3 text-amber-500 mr-1" />
                  <h3 className="text-xs font-medium text-amber-800">Sugestão 5W2H:</h3>
                </div>
                <div className="text-xs text-amber-700 space-y-1">
                  {analysisState.result.plan5w2h.what && <p><strong>O quê:</strong> {analysisState.result.plan5w2h.what}</p>}
                  {analysisState.result.plan5w2h.why && <p><strong>Por quê:</strong> {analysisState.result.plan5w2h.why}</p>}
                  {analysisState.result.plan5w2h.who && <p><strong>Quem:</strong> {analysisState.result.plan5w2h.who}</p>}
                  {analysisState.result.plan5w2h.where && <p><strong>Onde:</strong> {analysisState.result.plan5w2h.where}</p>}
                  {analysisState.result.plan5w2h.how && <p><strong>Como:</strong> {analysisState.result.plan5w2h.how}</p>}
                  {analysisState.result.plan5w2h.howMuch && <p><strong>Quanto:</strong> {analysisState.result.plan5w2h.howMuch}</p>}
                </div>
                {onAdd5W2HActionPlan && (
                  <Button
                    size="sm"
                    variant="default"
                    className="mt-2 w-full bg-amber-500 hover:bg-amber-600"
                    onClick={() => {
                      onAdd5W2HActionPlan(analysisState.result.plan5w2h!);
                      onOpenChange(false);
                    }}
                  >
                    Usar Sugestão 5W2H
                  </Button>
                )}
              </div>
            )}
            {!analysisState.result.hasNonConformity && (
              <div className="w-full mt-2 text-center text-xs p-2 rounded-md bg-green-50 text-green-800 border border-green-200">
                {analysisState.result.analysis ? "Análise concluída. Nenhuma ação sugerida." : "Análise concluída."}
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
