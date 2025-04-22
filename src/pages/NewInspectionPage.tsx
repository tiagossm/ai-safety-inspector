
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetchChecklistData } from "@/hooks/checklist/useFetchChecklistData";

export default function NewInspectionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  // Improve checklistId retrieval - check both URL parameter and query parameter
  const checklistId = id || searchParams.get("checklistId") || "";
  
  // Add detailed logging for debugging
  console.log("NewInspectionPage - URL Info:", { 
    id, 
    searchParams: Object.fromEntries(searchParams.entries()), 
    checklistId 
  });
  
  const checklistQuery = useFetchChecklistData(checklistId);

  useEffect(() => {
    const loadChecklistData = async () => {
      if (!checklistId) {
        setError("ID do checklist não fornecido. Verifique o parâmetro checklistId na URL.");
        setLoading(false);
        return;
      }

      if (checklistQuery.isLoading) {
        setLoading(true);
        return;
      }

      if (checklistQuery.error) {
        console.error("Erro ao carregar checklist:", checklistQuery.error);
        setError(`Erro ao carregar checklist: ${checklistQuery.error}`);
        setLoading(false);
        return;
      }

      if (checklistQuery.data) {
        console.log("Checklist carregado com sucesso:", checklistQuery.data);
        setLoading(false);
        
        // Always use checklistId parameter to ensure consistency
        navigate(`/inspections/start/${checklistId}`);
      } else {
        setError(`Não foi possível encontrar o checklist com ID ${checklistId}`);
        setLoading(false);
      }
    };

    loadChecklistData();
  }, [checklistId, checklistQuery, navigate]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-pulse mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <div className="w-6 h-6 rounded-full bg-primary/40"></div>
        </div>
        <p className="text-muted-foreground">Carregando checklist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 max-w-3xl mx-auto px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-medium">Erro ao carregar checklist</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{error}</p>
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={() => navigate("/checklists")} className="text-sm">
                Voltar para Checklists
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

  // Show loading while redirecting
  return (
    <div className="py-20 text-center">
      <div className="animate-pulse mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
        <div className="w-6 h-6 rounded-full bg-primary/40"></div>
      </div>
      <p className="text-muted-foreground">Preparando inspeção...</p>
    </div>
  );
}
