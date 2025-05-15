
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ReportGenerationDialog } from "@/components/inspection/ReportGenerationDialog";
import { InspectionSummary } from "@/components/inspection/InspectionSummary";
import { SignatureSection } from "@/components/inspection/SignatureSection";

export default function SimpleInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const {
    loading,
    error,
    inspection,
    questions,
    responses,
    company,
  } = useInspectionData(id);

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
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const companyName = company?.fantasy_name || "Empresa não identificada";
  const checklistTitle = inspection?.checklist?.title || inspection?.title || "Inspeção";

  // Helper to render the user's answer and its media/notes
  const renderQuestionResponse = (question: any, response: any) => {
    const answer = response?.value ?? response?.answer ?? "Não respondido";
    const notes = response?.comment ?? response?.notes ?? "";
    const mediaUrls: string[] = response?.mediaUrls || response?.media_urls || [];

    return (
      <Card key={question.id} className="p-4 mb-2">
        <div className="space-y-2">
          <h3 className="font-medium">{question.text || question.pergunta}</h3>
          <div className="flex flex-col md:flex-row md:justify-between gap-2">
            <p>
              <span className="text-muted-foreground mr-2">Resposta:</span>
              <span className={answer === "Não respondido" ? "text-amber-600" : undefined}>
                {answer}
              </span>
            </p>
          </div>
          {notes && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Observações:</p>
              <p className="text-sm">{notes}</p>
            </div>
          )}
          {mediaUrls.length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-1">Mídias:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="border rounded overflow-hidden h-24">
                    <img src={url} alt="Anexo" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-semibold">{checklistTitle}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={() => setReportDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF / Export
          </Button>
        </div>
      </div>

      {/* Inspection summary and signatures */}
      <div className="mb-6">
        <InspectionSummary
          inspection={inspection}
          responsibleName={inspection?.responsible?.name}
          companyName={companyName}
          checklistTitle={checklistTitle}
        />
        <div className="mt-6">
          <SignatureSection
            inspectionId={inspection.id}
            isCompleted={!!inspection?.assinatura_tecnico && !!inspection?.assinatura_responsavel}
          />
        </div>
      </div>

      <div className="space-y-6">
        {questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Este checklist não possui questões.
          </p>
        ) : (
          questions.map((question) => {
            // Try multiple fallback paths for response object compatibility
            const response =
              (responses && responses[question.id]) || {};

            return renderQuestionResponse(question, response);
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
