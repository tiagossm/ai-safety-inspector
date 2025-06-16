
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
    loading,
    error,
    detailedError,
    inspection,
    questions,
    groups,
    responses,
    company,
    responsible,
    responsibles,
    subChecklists,
    setResponses,
    refreshData,
    completeInspection,
    reopenInspection,
    handleResponseChange,
    handleMediaUpload,
    handleMediaChange,
    handleSaveInspection,
    savingResponses
  } = useInspectionData(id!);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await handleSaveInspection();
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
      await completeInspection(inspection);
      toast.success("Inspeção concluída com sucesso!");
      navigate("/inspections");
    } catch (error) {
      console.error("Erro ao concluir inspeção:", error);
      toast.error("Erro ao concluir inspeção");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReopen = async () => {
    setIsSaving(true);
    try {
      await reopenInspection(inspection);
      toast.success("Inspeção reaberta com sucesso!");
      refreshData();
    } catch (error) {
      console.error("Erro ao reabrir inspeção:", error);
      toast.error("Erro ao reabrir inspeção");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
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
              {typeof error === 'string' ? error : "Erro ao carregar inspeção"}
            </p>
            <Button onClick={() => navigate("/inspections")} className="w-full">
              Voltar para Inspeções
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inspection) {
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

  // Calculate stats for groups
  const stats = {
    completionPercentage: 0,
    groupStats: groups.reduce((acc, group) => {
      const groupQuestions = questions.filter(q => q.groupId === group.id);
      acc[group.id] = {
        total: groupQuestions.length,
        completed: groupQuestions.filter(q => responses[q.id]?.value !== undefined).length
      };
      return acc;
    }, {} as Record<string, { total: number; completed: number }>)
  };

  return (
    <InspectionDataProvider inspectionId={id}>
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
              <h1 className="text-2xl font-bold">{inspection.title || "Inspeção"}</h1>
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
            loading={loading}
            saving={isSaving || savingResponses}
            autoSave={false}
            setAutoSave={() => {}}
            lastSaved={null}
            inspectionStatus={inspection.status}
            completionPercentage={stats.completionPercentage}
            inspection={inspection}
            onSaveProgress={handleSave}
            onCompleteInspection={handleComplete}
            onReopenInspection={handleReopen}
            onViewActionPlan={() => {}}
            onGenerateReport={() => {}}
            refreshData={refreshData}
          />
        </div>

        <Separator />

        {/* Formulário de cabeçalho da inspeção */}
        <InspectionHeaderForm
          inspectionId={id!}
          inspection={inspection}
          company={company}
          responsible={responsible}
          onSave={refreshData}
        />

        <Separator />

        {/* Perguntas agrupadas */}
        <QuestionGroups
          groups={groups.length > 0 ? groups : [{ id: "default-group", title: "Geral", order: 0 }]}
          currentGroupId={groups.length > 0 ? groups[0].id : "default-group"}
          onGroupChange={() => {}}
          stats={stats}
        />

        {/* Botão de navegação rápida para testar ResponseTypeSelector */}
        <QuickNavigationButton />
      </div>
    </InspectionDataProvider>
  );
}
