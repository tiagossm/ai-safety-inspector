
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { supabase } from "@/integrations/supabase/client";
import { exportChecklistToPDF, exportChecklistToCSV, shareChecklistViaWhatsApp, printChecklist } from "@/utils/pdfExport";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function NewInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: checklist, isLoading, error } = useChecklistById(id || "");
  const [isStarting, setIsStarting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar checklist. Verifique o ID ou tente novamente.");
      navigate("/new-checklists");
    }
  }, [error, navigate]);

  const handleStartInspection = async () => {
    if (!checklist || isStarting) return;
    
    setIsStarting(true);
    setValidationError(null);
    
    try {
      console.log("Starting inspection for checklist:", checklist.id);
      
      // Create a new inspection record with all required fields
      // Making sure to include a valid CNAE format (00.00-0)
      const { data, error } = await supabase
        .from("inspections")
        .insert({
          checklist_id: checklist.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status: "Pendente",
          checklist: {
            title: checklist.title,
            description: checklist.description,
            total_questions: checklist.totalQuestions || 0
          },
          // Add cnae field with a valid format to fix the constraint violation
          cnae: "00.00-0", // Valid CNAE format
          approval_status: "pending",
          company_id: checklist.companyId || null
        })
        .select("id")
        .single();

      if (error) {
        console.error("Detailed error from Supabase:", error);
        setValidationError(`Erro ao iniciar inspeção: ${error.message || "Erro desconhecido"}`);
        throw error;
      }

      if (data) {
        toast.success("Inspeção iniciada com sucesso!");
        // Navigate back to checklists since the inspection UI is not ready
        navigate("/new-checklists");
      }
    } catch (error: any) {
      console.error("Error starting inspection:", error);
      toast.error(`Erro ao iniciar inspeção: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!checklist) return;
    try {
      toast.info("Exportando para PDF...");
      await exportChecklistToPDF(checklist);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error("PDF export error:", error);
    }
  };

  const handleExportCSV = () => {
    if (!checklist) return;
    try {
      toast.info("Exportando para CSV...");
      exportChecklistToCSV(checklist);
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
      console.error("CSV export error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Checklist não encontrado</h2>
        <Button variant="outline" onClick={() => navigate("/new-checklists")}>
          Voltar para Checklists
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/new-checklists")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Iniciar Nova Inspeção</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{checklist.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Descrição:</h3>
            <p className="text-gray-600">{checklist.description || "Sem descrição"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Categoria:</h3>
              <p>{checklist.category || "Não especificada"}</p>
            </div>
            <div>
              <h3 className="font-medium">Total de perguntas:</h3>
              <p>{checklist.totalQuestions || 0}</p>
            </div>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-4 pt-4">
            <Button 
              onClick={handleStartInspection}
              disabled={isStarting}
              className="bg-teal-600 hover:bg-teal-700 w-full"
            >
              <ClipboardCheck className="h-5 w-5 mr-2" />
              {isStarting ? "Iniciando..." : "Iniciar Inspeção Agora"}
            </Button>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button variant="outline" onClick={handleExportPDF}>
                Exportar como PDF
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                Exportar como CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
