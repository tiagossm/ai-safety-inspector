
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, AlertTriangle, RefreshCw } from "lucide-react";

interface MediaAnalysisButtonProps {
  onOpenAnalysis: () => void;
  onForceRetry?: () => void;
  canRetry?: boolean;
  analyzing?: boolean;
  analysisStatus?: {
    queueSize: number;
    failedCount: number;
    hasFailures: boolean;
  };
}

export function MediaAnalysisButton({ 
  onOpenAnalysis, 
  onForceRetry,
  canRetry = false, 
  analyzing = false,
  analysisStatus 
}: MediaAnalysisButtonProps) {
  const hasFailures = analysisStatus?.hasFailures || canRetry;
  const queueSize = analysisStatus?.queueSize || 0;
  
  // Status do botão baseado no estado atual
  const getButtonVariant = () => {
    if (hasFailures) return "destructive";
    if (analyzing) return "secondary";
    return "outline";
  };

  const getButtonText = () => {
    if (analyzing && queueSize > 0) return `Analisando... (${queueSize} na fila)`;
    if (analyzing) return "Analisando...";
    if (hasFailures) return "Tentar Novamente";
    return "Analisar com IA";
  };

  const getButtonIcon = () => {
    if (analyzing) return <RotateCcw className="h-3.5 w-3.5 mr-1 animate-spin" />;
    if (hasFailures) return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
    return <Search className="h-3.5 w-3.5 mr-1" />;
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <Button
        variant={getButtonVariant()}
        size="sm"
        onClick={onOpenAnalysis}
        disabled={analyzing}
        className={`${
          hasFailures 
            ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
            : analyzing
            ? "bg-gray-50 text-gray-700 border-gray-200"
            : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        } disabled:opacity-50`}
        type="button"
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>
      
      {/* Botão de força re-análise se houver falhas e callback */}
      {hasFailures && onForceRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onForceRetry}
          disabled={analyzing}
          className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 px-2"
          type="button"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Forçar Re-análise
        </Button>
      )}
      
      {/* Indicador de status detalhado */}
      {analysisStatus && (analysisStatus.failedCount > 0 || queueSize > 0) && (
        <div className="text-xs text-gray-500 space-y-1">
          {queueSize > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              {queueSize} análise{queueSize > 1 ? 's' : ''} na fila
            </div>
          )}
          {analysisStatus.failedCount > 0 && (
            <div className="flex items-center gap-1 text-red-500">
              <AlertTriangle className="h-3 w-3" />
              {analysisStatus.failedCount} análise{analysisStatus.failedCount > 1 ? 's' : ''} falharam
            </div>
          )}
        </div>
      )}
    </div>
  );
}
