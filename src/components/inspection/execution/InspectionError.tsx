
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, AlertTriangle } from "lucide-react";

interface InspectionErrorProps {
  error: string | null;
  detailedError: any;
  refreshData: () => void;
}

export function InspectionError({ error, detailedError, refreshData }: InspectionErrorProps) {
  const navigate = useNavigate();

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-4">
        <h1 className="text-xl font-medium text-gray-800">Inspeção</h1>
        <p className="text-sm text-gray-500">Execução de checklist</p>
      </div>
      
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-base font-medium">Erro ao carregar inspeção</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>{error}</p>
          {detailedError && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded text-sm">
              <p className="flex items-center font-medium text-red-800"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> Detalhes do erro:</p>
              <p className="mt-1 text-red-700">
                {detailedError.message || JSON.stringify(detailedError)}
              </p>
              {detailedError.hint && <p className="mt-1 text-red-700">Sugestão: {detailedError.hint}</p>}
              {detailedError.details && <p className="mt-1 text-red-700">Detalhes: {detailedError.details}</p>}
            </div>
          )}
          <div className="flex space-x-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/inspections")}
              className="text-sm"
            >
              Voltar para Inspeções
            </Button>
            <Button 
              variant="default" 
              onClick={refreshData}
              className="text-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
