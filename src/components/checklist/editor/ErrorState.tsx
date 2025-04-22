
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error: string;
  backPath?: string;
  backLabel?: string;
}

export function ErrorState({ 
  error, 
  backPath = "/checklists", 
  backLabel = "Voltar para Checklists" 
}: ErrorStateProps) {
  const navigate = useNavigate();
  
  return (
    <div className="py-10 max-w-3xl mx-auto px-4">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-base font-medium">Erro ao carregar checklist</AlertTitle>
        <AlertDescription className="mt-2">
          <p>{error}</p>
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => navigate(backPath)} className="text-sm">
              {backLabel}
            </Button>
            <Button variant="default" onClick={() => window.location.reload()} className="text-sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
