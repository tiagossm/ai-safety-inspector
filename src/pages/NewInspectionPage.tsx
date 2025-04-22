
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
  
  // Get checklistId from either URL param or query param
  const checklistId = id || searchParams.get("checklistId") || "";
  
  // Add detailed logging for debugging
  console.log("NewInspectionPage - URL Info:", { 
    id, 
    searchParams: Object.fromEntries(searchParams.entries()), 
    checklistId 
  });
  
  useEffect(() => {
    const redirectToStartPage = () => {
      if (!checklistId) {
        setError("ID do checklist não fornecido. Verifique o parâmetro checklistId na URL.");
        setLoading(false);
        return;
      }

      try {
        // Redirecionar para a nova tela de início de inspeção
        navigate(`/inspections/start/${checklistId}`, { replace: true });
      } catch (navigationError) {
        console.error("Erro de navegação:", navigationError);
        setError("Erro ao redirecionar para a nova página de início da inspeção");
        setLoading(false);
      }
    };

    // Pequeno delay para garantir que os parâmetros foram carregados
    const timer = setTimeout(redirectToStartPage, 100);
    
    return () => clearTimeout(timer);
  }, [checklistId, navigate]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-pulse mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <div className="w-6 h-6 rounded-full bg-primary/40"></div>
        </div>
        <p className="text-muted-foreground">Redirecionando para a nova tela de inspeção...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 max-w-3xl mx-auto px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-medium">Erro ao iniciar inspeção</AlertTitle>
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

  // Mostrar loading enquanto redireciona
  return (
    <div className="py-20 text-center">
      <div className="animate-pulse mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
        <div className="w-6 h-6 rounded-full bg-primary/40"></div>
      </div>
      <p className="text-muted-foreground">Preparando a nova experiência de inspeção...</p>
    </div>
  );
}
