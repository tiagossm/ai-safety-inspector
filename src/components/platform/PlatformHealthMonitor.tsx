
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

const DEMO_ALERTS = [
  {
    id: '1',
    type: 'performance',
    message: 'Performance degradada no módulo de relatórios',
    severity: 'warning',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
  },
  {
    id: '2',
    type: 'billing',
    message: '3 empresas com pagamento pendente há mais de 7 dias',
    severity: 'critical',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  }
];

export function PlatformHealthMonitor() {
  const [systemStatus, setSystemStatus] = useState({
    overall: 'healthy', // healthy, degraded, critical
    components: {
      database: { status: 'healthy', latency: 32 },
      api: { status: 'healthy', latency: 45 },
      storage: { status: 'degraded', latency: 230 },
      auth: { status: 'healthy', latency: 63 }
    },
    uptime: 99.98,
    alerts: DEMO_ALERTS
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': 
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Saudável
        </Badge>;
      case 'degraded': 
        return <Badge variant="warning" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Degradado
        </Badge>;
      case 'critical': 
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Crítico
        </Badge>;
      default: 
        return <Badge>Desconhecido</Badge>;
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info': return <Badge variant="secondary">Informação</Badge>;
      case 'warning': return <Badge variant="warning">Alerta</Badge>;
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      default: return <Badge>Desconhecido</Badge>;
    }
  };
  
  const formatTimeSince = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min atrás`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return `${diffHours} h atrás`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} d atrás`;
      }
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Saúde do Sistema</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${getStatusColor(systemStatus.overall)}`}></div>
            <span className="text-sm font-medium">
              {systemStatus.overall === 'healthy' ? 'Todos os sistemas operacionais' : 
               systemStatus.overall === 'degraded' ? 'Performance degradada' : 
               'Problemas críticos detectados'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - System Components */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Componentes do Sistema</h3>
            <div className="space-y-3">
              {Object.entries(systemStatus.components).map(([name, data]) => (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm capitalize">{name}</span>
                    {getStatusBadge(data.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={data.status === 'healthy' ? 100 : data.status === 'degraded' ? 60 : 30} 
                      className={`h-2 ${
                        data.status === 'healthy' ? 'bg-green-200' : 
                        data.status === 'degraded' ? 'bg-yellow-200' : 'bg-red-200'
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">{data.latency}ms</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm">Uptime: {systemStatus.uptime}%</span>
              <Button variant="outline" size="sm">Ver Detalhes</Button>
            </div>
          </div>
          
          {/* Right column - Active Alerts */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Alertas Ativos</h3>
            <div className="space-y-3">
              {systemStatus.alerts.length > 0 ? (
                systemStatus.alerts.map(alert => (
                  <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'warning'}>
                    <div className="flex justify-between items-start">
                      <div>
                        <AlertTitle className="flex items-center gap-2">
                          {getSeverityBadge(alert.severity)}
                          <span className="capitalize">{alert.type}</span>
                        </AlertTitle>
                        <AlertDescription>
                          {alert.message}
                        </AlertDescription>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeSince(alert.created_at)}
                      </span>
                    </div>
                  </Alert>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 border rounded-md">
                  <p className="text-sm text-muted-foreground">Nenhum alerta ativo no momento</p>
                </div>
              )}
            </div>
            {systemStatus.alerts.length > 0 && (
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm">Resolver Todos</Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
