
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { ReportGenerationDialog } from "@/components/inspection/ReportGenerationDialog";

export default function SimpleInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  
  const {
    loading,
    error,
    inspection,
    questions,
    responses,
    company,
  } = useInspectionData(id);
  
  // Handle any loading/error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="py-10 px-4 text-center">
        <p className="text-xl text-red-600 mb-4">Erro ao carregar inspeção</p>
        <p className="text-gray-600">{error || "Inspeção não encontrada"}</p>
      </div>
    );
  }
  
  const companyName = company?.fantasy_name || "Empresa não identificada";
  const checklistTitle = inspection?.checklist?.title || "Inspeção";
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{checklistTitle}</h1>
        <Button 
          onClick={() => setReportDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Gerar Relatório
        </Button>
      </div>
      
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Empresa</h2>
            <p>{companyName}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2">Status</h2>
            <p>{inspection.status}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2">Responsável</h2>
            <p>{inspection.responsible?.name || "Não definido"}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2">Data</h2>
            <p>{new Date(inspection.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>
      
      <div className="space-y-6">
        {questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Este checklist não possui questões.
          </p>
        ) : (
          questions.map((question) => {
            const response = responses[question.id];
            const answer = response?.answer || "Não respondido";
            
            return (
              <Card key={question.id} className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium">{question.text || question.pergunta}</h3>
                  
                  <div className="flex justify-between">
                    <p>
                      <span className="text-muted-foreground mr-2">Resposta:</span> 
                      <span className={answer === "Não respondido" ? "text-amber-600" : undefined}>
                        {answer}
                      </span>
                    </p>
                  </div>
                  
                  {response?.notes && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">Observações:</p>
                      <p className="text-sm">{response.notes}</p>
                    </div>
                  )}
                  
                  {response?.mediaUrls && response.mediaUrls.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-1">Mídias:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {response.mediaUrls.map((url, index) => (
                          <div key={index} className="border rounded overflow-hidden h-20">
                            <img src={url} alt="Anexo" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
      
      <ReportGenerationDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        inspectionId={id || ""}
        companyName={companyName}
        checklistTitle={checklistTitle}
      />
    </div>
  );
}
