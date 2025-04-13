
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ChecklistErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function ChecklistErrorState({ error, onRetry }: ChecklistErrorStateProps) {
  const navigate = useNavigate();
  
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 px-4" 
      role="alert" 
      aria-live="assertive"
    >
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" aria-hidden="true" />
      <h2 className="text-xl font-bold mb-2">Erro ao carregar checklist</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        {error.toString()}
      </p>
      <div className="flex gap-4">
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline"
            aria-label="Tentar carregar novamente"
          >
            <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Tentar novamente
          </Button>
        )}
        <Button 
          onClick={() => navigate("/new-checklists")}
          aria-label="Voltar para a lista de checklists"
        >
          Voltar para lista
        </Button>
      </div>
    </div>
  );
}
