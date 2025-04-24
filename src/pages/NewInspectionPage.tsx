
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateInspection } from "@/hooks/inspection/useCreateInspection";

export default function NewInspectionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { createInspection, creating, error: creationError } = useCreateInspection();

  // Get checklist ID from either route param or query param
  const checklistId = id || searchParams.get("checklistId") || "";

  useEffect(() => {
    if (!checklistId) {
      setError("ID do checklist não fornecido. Verifique a URL.");
      setLoading(false);
      return;
    }

    const initializeInspection = async () => {
      try {
        const inspection = await createInspection(checklistId);
        // Only redirect after successful creation
        navigate(`/inspections/${inspection.id}/view`, { replace: true });
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    initializeInspection();
  }, [checklistId, navigate, createInspection]);

  if ((loading || creating) && !error) {
    return (
      <div className="py-20 text-center">
        <div className="animate-pulse mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <div className="w-6 h-6 rounded-full bg-primary/40"></div>
        </div>
        <p className="text-muted-foreground">
          {creating ? "Criando nova inspeção..." : "Inicializando..."}
        </p>
      </div>
    );
  }

  if (error || creationError) {
    return (
      <div className="py-10 max-w-3xl mx-auto px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-medium">Erro ao iniciar inspeção</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{error || creationError}</p>
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

  return null;
}
