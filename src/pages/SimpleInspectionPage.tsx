
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ArrowLeft } from "lucide-react";
import { ReportGenerationDialog } from "@/components/inspection/ReportGenerationDialog";
import { InspectionSummary } from "@/components/inspection/InspectionSummary";
import { SignatureSection } from "@/components/inspection/SignatureSection";
import { InspectionAnswersSummary } from "@/components/inspection/InspectionAnswersSummary";

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
            Voltar
          </Button>
          <Button
            onClick={() => setReportDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF / Exportar
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <InspectionSummary
          inspection={inspection}
          responsibleName={inspection?.responsible?.name}
          companyName={companyName}
          checklistTitle={checklistTitle}
        />
        
        {inspection.id && (
          <div className="mt-6">
            <SignatureSection
              inspectionId={inspection.id}
              isCompleted={inspection.status === "Concluído" || inspection.status === "Completed"}
            />
          </div>
        )}
      </div>

      {/* --- Resumo das Respostas --- */}
      <InspectionAnswersSummary
        questions={questions}
        responses={responses}
      />

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
