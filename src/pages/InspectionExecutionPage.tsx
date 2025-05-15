import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, ArrowLeft, ClipboardList } from "lucide-react";
import { InspectionLayout } from "@/components/inspection/execution/InspectionLayout";
import { InspectionError } from "@/components/inspection/execution/InspectionError";
import { InspectionHeaderForm } from "@/components/inspection/execution/InspectionHeaderForm";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { useActionPlans } from "@/hooks/inspection/useActionPlans";
import { INSPECTION_STATUSES } from "@/types/inspection";
import { SubChecklistDialog } from "@/components/inspection/dialogs/SubChecklistDialog";
import { useSubChecklistDialog } from "@/hooks/inspection/useSubChecklistDialog";
import { generateInspectionPDF } from "@/services/inspection/reportService";

export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ Use the unified hook that handles merging and correct state updates
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
  } = useInspectionData(id);

  const {
    plansByQuestion,
    stats: actionPlanStats,
    loading: loadingActionPlans,
    saveActionPlan,
    refreshPlans
  } = useActionPlans(id);

  const {
    subChecklistDialogOpen,
    setSubChecklistDialogOpen,
    currentSubChecklist,
    currentParentQuestionId,
    savingSubChecklist,
    handleOpenSubChecklist,
    handleSaveSubChecklistResponses: saveSubChecklistResponses,
    safeParseResponse
  } = useSubChecklistDialog(responses, handleResponseChange, handleSaveInspection);

  useEffect(() => {
    if (!loading && !currentGroupId && groups && groups.length > 0) {
      setCurrentGroupId(groups[0].id);
    }
  }, [loading, groups, currentGroupId]);

  const isInspectionEditable = () => {
    return inspection && [INSPECTION_STATUSES.PENDING, INSPECTION_STATUSES.IN_PROGRESS].includes(inspection.status);
  };

  const calculateStats = () => {
    const totalQuestions = questions?.length || 0;
    if (totalQuestions === 0) {
      return {
        percentage: 0,
        answered: 0,
        total: 0,
        completionPercentage: 0,
        groupStats: {}
      };
    }

    const answeredQuestions = Object.keys(responses || {}).filter(questionId => {
      const response = responses[questionId];
      return response?.value !== undefined && response?.value !== null;
    }).length;

    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);

    const groupStats = {};
    if (questions && questions.length > 0) {
      questions.forEach(question => {
        const groupId = question.groupId || 'default-group';
        if (!groupStats[groupId]) {
          groupStats[groupId] = { total: 0, answered: 0 };
        }
        groupStats[groupId].total++;
        if (responses && responses[question.id] && responses[question.id].value !== undefined) {
          groupStats[groupId].answered++;
        }
      });
    }

    return {
      percentage,
      answered: answeredQuestions,
      total: totalQuestions,
      completionPercentage: percentage,
      groupStats
    };
  };

  const getFilteredQuestions = (groupId: string | null) => {
    if (!groupId || !questions) return [];
    return questions.filter(q => (q.groupId || 'default-group') === groupId);
  };

  const handleSaveProgress = async () => {
    if (saving || !id || !inspection) return;
    setSaving(true);
    try {
      await handleSaveInspection();
      setLastSaved(new Date());
      toast.success("Progresso salvo com sucesso");
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast.error(`Erro ao salvar progresso: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteInspection = async () => {
    if (!id || !inspection) return;
    try {
      setSaving(true);
      await handleSaveInspection();
      await completeInspection(inspection);
      try {
        toast.info("Gerando relatório PDF...");
        const reportOptions = {
          inspectionId: id,
          includeImages: true,
          includeComments: true,
          includeActionPlans: true,
          format: 'pdf' as 'pdf'
        };
        const pdfUrl = await generateInspectionPDF(reportOptions);
        toast.success("Inspeção finalizada com sucesso e relatório gerado");
        await refreshData();
        await refreshPlans();
        navigate(`/inspections/${id}`);
      } catch (pdfError: any) {
        console.error("Error generating PDF:", pdfError);
        toast.error(`Erro ao gerar relatório: ${pdfError.message || 'Erro desconhecido'}`);
        navigate(`/inspections/${id}`);
      }
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      toast.error(`Erro ao finalizar inspeção: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReopenInspection = async () => {
    if (!id || !inspection) return;
    try {
      setSaving(true);
      await reopenInspection(inspection);
      await refreshData();
      toast.success("Inspeção reaberta com sucesso");
    } catch (error: any) {
      console.error("Error reopening inspection:", error);
      toast.error(`Erro ao reabrir inspeção: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <InspectionLayout
      loading={loading}
      error={error}
      detailedError={detailedError}
      inspection={inspection}
      questions={questions}
      responses={responses}
      currentGroupId={currentGroupId}
      setCurrentGroupId={setCurrentGroupId}
      isInspectionEditable={isInspectionEditable()}
      calculateStats={calculateStats}
      getFilteredQuestions={getFilteredQuestions}
      handleResponseChange={handleResponseChange}
      handleMediaUpload={handleMediaUpload}
      handleMediaChange={handleMediaChange}
      handleSaveProgress={handleSaveProgress}
      handleCompleteInspection={handleCompleteInspection}
      handleReopenInspection={handleReopenInspection}
      autoSave={autoSave}
      setAutoSave={setAutoSave}
      lastSaved={lastSaved}
      actionPlanStats={actionPlanStats}
      plansByQuestion={plansByQuestion}
      saveActionPlan={saveActionPlan}
      subChecklists={subChecklists}
      subChecklistDialogOpen={subChecklistDialogOpen}
      setSubChecklistDialogOpen={setSubChecklistDialogOpen}
      currentSubChecklist={currentSubChecklist}
      currentParentQuestionId={currentParentQuestionId}
      savingSubChecklist={savingSubChecklist}
      handleOpenSubChecklist={handleOpenSubChecklist}
      handleSaveSubChecklistResponses={saveSubChecklistResponses}
      safeParseResponse={safeParseResponse}
    />
  );
}
