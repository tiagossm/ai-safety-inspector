
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { InspectionDataProvider } from "@/components/inspection/execution/InspectionDataProvider";
import { InspectionHeaderForm } from "@/components/inspection/execution/InspectionHeaderForm";
import { QuestionGroups } from "@/components/inspection/QuestionGroups";
import { ActionButtons } from "@/components/inspection/execution/ActionButtons";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { QuickNavigationButton } from "@/components/inspection/execution/QuickNavigationButton";

export default function InspectionExecutionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    inspection,
    checklist,
    questions,
    isLoading,
    error,
    updateInspectionField,
    updateQuestionResponse,
    saveInspection
  } = useInspectionData(id!);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveInspection();
      toast.success("Inspeção salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar inspeção:", error);
      toast.error("Erro ao salvar inspeção");
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // Atualizar status para concluído antes de salvar
      await updateInspectionField("status", "completed");
      await saveInspection();
      toast.success("Inspeção concluída com sucesso!");
      navigate("/inspections");
    } catch (error) {
      console.error("Erro ao concluir inspeção:", error);
      toast.error("Erro ao concluir inspeção");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando inspeção...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : "Erro ao carregar inspeção"}
            </p>
            <Button onClick={() => navigate("/inspections")} className="w-full">
              Voltar para Inspeções
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inspection || !checklist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Inspeção não encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              A inspeção solicitada não foi encontrada.
            </p>
            <Button onClick={() => navigate("/inspections")} className="w-full">
              Voltar para Inspeções
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <InspectionDataProvider
      inspection={inspection}
      checklist={checklist}
      questions={questions}
      updateInspectionField={updateInspectionField}
      updateQuestionResponse={updateQuestionResponse}
    >
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/inspections")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{checklist.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={inspection.status === "completed" ? "default" : "secondary"}>
                  {inspection.status === "completed" ? "Concluída" : "Em Andamento"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {inspection.id}
                </span>
              </div>
            </div>
          </div>

          <ActionButtons
            onSave={handleSave}
            onComplete={handleComplete}
            isSaving={isSaving}
            isCompleted={inspection.status === "completed"}
          />
        </div>

        <Separator />

        {/* Formulário de cabeçalho da inspeção */}
        <InspectionHeaderForm />

        <Separator />

        {/* Perguntas agrupadas */}
        <QuestionGroups />

        {/* Botão de navegação rápida para testar ResponseTypeSelector */}
        <QuickNavigationButton />
      </div>
    </InspectionDataProvider>
  );
}
