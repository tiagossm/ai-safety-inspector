import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Zap, RotateCcw, X } from "lucide-react";
import { useMediaAnalysis } from "@/hooks/useMediaAnalysis";

interface MediaAnalysisDebugDashboardProps {
  onClose?: () => void;
}

export function MediaAnalysisDebugDashboard({ onClose }: MediaAnalysisDebugDashboardProps) {
  const { getAnalysisStatus, getDebugInfo, resetAllState, cancelAllAnalysis } = useMediaAnalysis();
  const [debugData, setDebugData] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Atualizar dados do debug a cada 2 segundos
  useEffect(() => {
    const updateDebugData = () => {
      const status = getAnalysisStatus();
      const debug = getDebugInfo();
      setDebugData({ status, debug });
    };

    updateDebugData();

    if (autoRefresh) {
      const interval = setInterval(updateDebugData, 2000);
      return () => clearInterval(interval);
    }
  }, [getAnalysisStatus, getDebugInfo, autoRefresh]);

  if (!debugData) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RotateCcw className="h-6 w-6 animate-spin mr-2" />
            Carregando dados de debug...
          </div>
        </CardContent>
      </Card>
    );
  }

  const { status, debug } = debugData;

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'bg-green-100 text-green-800';
      case 'HALF_OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'OPEN': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCircuitBreakerIcon = (state: string) => {
    switch (state) {
      case 'CLOSED': return <CheckCircle className="h-4 w-4" />;
      case 'HALF_OPEN': return <Clock className="h-4 w-4" />;
      case 'OPEN': return <Zap className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Debug Dashboard - Análise de Mídia
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Pausar' : 'Continuar'} Auto-Refresh
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${status.analyzing ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="font-medium">Status</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {status.analyzing ? 'Analisando' : 'Parado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  <span className="font-medium">Fila</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {status.queueSize} item{status.queueSize !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Falhas</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {status.failedCount} falha{status.failedCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {getCircuitBreakerIcon(status.circuitBreakerState)}
                  <span className="font-medium">Circuit Breaker</span>
                </div>
                <Badge className={`text-xs mt-1 ${getCircuitBreakerColor(status.circuitBreakerState)}`}>
                  {status.circuitBreakerState}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Circuit Breaker Detalhado */}
          {debug.state.circuitBreaker && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Circuit Breaker Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Estado</p>
                    <Badge className={getCircuitBreakerColor(debug.state.circuitBreaker.state)}>
                      {debug.state.circuitBreaker.state}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Falhas Consecutivas</p>
                    <p className="text-lg font-bold text-red-600">
                      {debug.state.circuitBreaker.failures}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Última Falha</p>
                    <p className="text-sm text-gray-600">
                      {debug.state.circuitBreaker.lastFailure 
                        ? new Date(debug.state.circuitBreaker.lastFailure).toLocaleTimeString()
                        : 'Nenhuma'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requisições Ativas */}
          {debug.active && debug.active.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requisições Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debug.active.map(([key, info]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{key.substring(0, 50)}...</p>
                        <p className="text-xs text-gray-600">
                          Iniciado: {new Date(info.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Tentativa #{info.attempt}</p>
                        <p className="text-xs text-gray-600">
                          {Math.round((Date.now() - info.startTime) / 1000)}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fila de Requisições */}
          {debug.queue && debug.queue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fila de Requisições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debug.queue.map((key: string, index: number) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium">#{index + 1}: {key.substring(0, 50)}...</p>
                      <Badge variant="secondary">Na fila</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requisições Falhas */}
          {debug.failed && debug.failed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requisições com Falha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debug.failed.map((key: string, index: number) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium">{key.substring(0, 50)}...</p>
                      <Badge variant="destructive">Falhou</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Controles de Emergência */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Controles de Emergência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  variant="destructive" 
                  onClick={cancelAllAnalysis}
                  disabled={!status.analyzing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar Todas Análises
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetAllState}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}