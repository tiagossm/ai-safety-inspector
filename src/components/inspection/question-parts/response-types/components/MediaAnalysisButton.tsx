
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, AlertTriangle, RefreshCw, X, Zap, Clock } from "lucide-react";

interface MediaAnalysisButtonProps {
  onOpenAnalysis: () => void;
  onForceRetry?: () => void;
  onCancelAnalysis?: () => void;
  onResetState?: () => void;
  canRetry?: boolean;
  analyzing?: boolean;
  analysisStatus?: {
    queueSize: number;
    failedCount: number;
    hasFailures: boolean;
    circuitBreakerState?: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    activeRequests?: number;
  };
}

export function MediaAnalysisButton({ 
  onOpenAnalysis, 
  onForceRetry,
  onCancelAnalysis,
  onResetState,
  canRetry = false, 
  analyzing = false,
  analysisStatus 
}: MediaAnalysisButtonProps) {
  const hasFailures = analysisStatus?.hasFailures || canRetry;
  const queueSize = analysisStatus?.queueSize || 0;
  const activeRequests = analysisStatus?.activeRequests || 0;
  const circuitState = analysisStatus?.circuitBreakerState || 'CLOSED';
  
  // Verificar se circuit breaker está aberto
  const isCircuitOpen = circuitState === 'OPEN';
  const isCircuitHalfOpen = circuitState === 'HALF_OPEN';
  
  // Status do botão baseado no estado atual
  const getButtonVariant = () => {
    if (isCircuitOpen) return "destructive";
    if (hasFailures) return "destructive";
    if (analyzing) return "secondary";
    return "outline";
  };

  const getButtonText = () => {
    if (isCircuitOpen) return "Análise Temporariamente Indisponível";
    if (analyzing && queueSize > 0) return `Analisando... (${queueSize} na fila)`;
    if (analyzing) return "Analisando...";
    if (hasFailures) return "Tentar Novamente";
    if (isCircuitHalfOpen) return "Teste de Recuperação";
    return "Analisar com IA";
  };

  const getButtonIcon = () => {
    if (isCircuitOpen) return <Zap className="h-3.5 w-3.5 mr-1 text-red-500" />;
    if (analyzing) return <RotateCcw className="h-3.5 w-3.5 mr-1 animate-spin" />;
    if (hasFailures) return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
    if (isCircuitHalfOpen) return <Clock className="h-3.5 w-3.5 mr-1 text-yellow-500" />;
    return <Search className="h-3.5 w-3.5 mr-1" />;
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex gap-2">
        <Button
          variant={getButtonVariant()}
          size="sm"
          onClick={onOpenAnalysis}
          disabled={analyzing}
          className={`flex-1 ${
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
        
        {/* Botão de cancelar quando analisando */}
        {analyzing && onCancelAnalysis && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelAnalysis}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      
      {/* Botões de ação secundários */}
      <div className="flex gap-2">
        {/* Botão de força re-análise se houver falhas e callback */}
        {hasFailures && onForceRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onForceRetry}
            disabled={analyzing || isCircuitOpen}
            className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 px-2 flex-1"
            type="button"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Forçar Re-análise
          </Button>
        )}
        
        {/* Botão de reset em caso de problemas */}
        {(hasFailures || isCircuitOpen) && onResetState && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetState}
            disabled={analyzing}
            className="text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-7 px-2 flex-1"
            type="button"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset Estado
          </Button>
        )}
      </div>
      
      {/* Indicador de status detalhado */}
      {analysisStatus && (analysisStatus.failedCount > 0 || queueSize > 0 || activeRequests > 0 || circuitState !== 'CLOSED') && (
        <div className="text-xs text-gray-500 space-y-1 p-2 bg-gray-50 rounded border">
          {/* Status do Circuit Breaker */}
          {circuitState !== 'CLOSED' && (
            <div className="flex items-center gap-1">
              {circuitState === 'OPEN' ? (
                <Zap className="h-3 w-3 text-red-500" />
              ) : (
                <Clock className="h-3 w-3 text-yellow-500" />
              )}
              <span className="font-medium">
                Circuit Breaker: {circuitState === 'OPEN' ? 'Aberto' : 'Meio-Aberto'}
              </span>
            </div>
          )}
          
          {/* Fila de análise */}
          {queueSize > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              {queueSize} análise{queueSize > 1 ? 's' : ''} na fila
            </div>
          )}
          
          {/* Requisições ativas */}
          {activeRequests > 0 && (
            <div className="flex items-center gap-1">
              <RotateCcw className="h-3 w-3 animate-spin text-blue-500" />
              {activeRequests} requisição{activeRequests > 1 ? 'ões' : ''} ativa{activeRequests > 1 ? 's' : ''}
            </div>
          )}
          
          {/* Análises que falharam */}
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
