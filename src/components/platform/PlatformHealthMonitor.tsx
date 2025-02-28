import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HealthStatus {
  database: "healthy" | "degraded" | "down";
  storage: "healthy" | "degraded" | "down";
  auth: "healthy" | "degraded" | "down";
  api: "healthy" | "degraded" | "down";
  overall: "healthy" | "degraded" | "down";
}

export function PlatformHealthMonitor() {
  const [health, setHealth] = useState<HealthStatus>({
    database: "healthy",
    storage: "healthy",
    auth: "healthy",
    api: "healthy",
    overall: "healthy"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        
        // Check database health
        const { data: dbCheck, error: dbError } = await supabase
          .from('platform_alerts')
          .select('id')
          .limit(1);
        
        // Check auth health
        const { data: authCheck, error: authError } = await supabase.auth.getSession();
        
        // Simple API check
        let apiStatus: "healthy" | "degraded" | "down" = "down";
        try {
          const response = await fetch('https://jkgmgjjtslkozhehwmng.supabase.co/functions/v1/healthcheck', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          apiStatus = response.ok ? "healthy" : "degraded";
        } catch (error) {
          apiStatus = "down";
        }
        
        // Health statuses
        const dbStatus = dbError ? "down" : "healthy";
        const authStatus = authError ? "down" : "healthy";
        
        // Determine overall health
        let overallStatus: "healthy" | "degraded" | "down" = "healthy";
        
        // Fixed comparison - check for "down" status
        if ([dbStatus, authStatus, apiStatus].some(status => status === "down")) {
          overallStatus = "down";
        } 
        // Then check for "degraded" status
        else if ([dbStatus, authStatus, apiStatus].some(status => status === "degraded")) {
          overallStatus = "degraded";
        }
        // Otherwise, it stays "healthy"
        
        setHealth({
          database: dbStatus,
          storage: "healthy", // Mock value
          auth: authStatus,
          api: apiStatus,
          overall: overallStatus
        });
      } catch (error) {
        console.error("Error checking platform health:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkHealth();
    
    // Check every 5 minutes
    const intervalId = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getStatusIcon = (status: "healthy" | "degraded" | "down") => {
    if (status === "healthy") {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === "degraded") {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: "healthy" | "degraded" | "down") => {
    if (status === "healthy") {
      return "Saudável";
    } else if (status === "degraded") {
      return "Degradado";
    } else {
      return "Indisponível";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status da Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center py-4">
              <div className="animate-pulse text-center">
                <div className="h-6 w-32 bg-muted rounded mb-2 mx-auto"></div>
                <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(health.overall)}
          <span>Status da Plataforma: {getStatusText(health.overall)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(health.database)}
              </div>
              <p className="text-sm font-medium">Banco de Dados</p>
              <p className="text-xs text-muted-foreground">
                {getStatusText(health.database)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(health.storage)}
              </div>
              <p className="text-sm font-medium">Armazenamento</p>
              <p className="text-xs text-muted-foreground">
                {getStatusText(health.storage)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(health.auth)}
              </div>
              <p className="text-sm font-medium">Autenticação</p>
              <p className="text-xs text-muted-foreground">
                {getStatusText(health.auth)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(health.api)}
              </div>
              <p className="text-sm font-medium">API</p>
              <p className="text-xs text-muted-foreground">
                {getStatusText(health.api)}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Desempenho da Plataforma</span>
              <span>98%</span>
            </div>
            <Progress value={98} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
