
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InspectionError } from "@/components/inspection/execution/InspectionError";
import { InspectionLayout } from "@/components/inspection/execution/InspectionLayout";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { InspectionDataProvider } from "@/components/inspection/execution/InspectionDataProvider";

// Componente principal da página de execução de inspeção
export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Redirecionar para página de criação de inspeção se não houver ID
  useEffect(() => {
    if (!id || id === "new") {
      console.log("No inspection ID provided or ID is 'new', redirecting to creation page");
      navigate("/inspections/new");
    }
  }, [id, navigate]);
  
  // Pular carregamento se estamos redirecionando
  const skipLoading = !id || id === "new";
  
  // Se estamos redirecionando, não renderizar nada
  if (!id || id === "new") {
    return null;
  }
  
  return (
    <InspectionDataProvider inspectionId={skipLoading ? undefined : id}>
      <InspectionView />
      <FloatingNavigation threshold={400} />
    </InspectionDataProvider>
  );
}

// Componente separado para visualização da inspeção
function InspectionView() {
  const [autoSave, setAutoSave] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [saving, setSaving] = React.useState(false);
  
  const {
    loading,
    inspection,
    error,
    detailedError,
    company,
    responsible,
    questions,
    responses,
    groups,
    subChecklists,
    currentGroupId,
    filteredQuestions,
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    getCompletionStats,
    getFilteredQuestions,
    refreshData,
    completeInspection,
    reopenInspection,
    setCurrentGroupId
  } = React.useContext(InspectionDataContext);
  
  // Auto-save configuration
  useEffect(() => {
    if (autoSave && !loading) {
      const timer = setTimeout(() => {
        onSaveProgress();
      }, 60000); // Auto-save every minute
      
      return () => clearTimeout(timer);
    }
  }, [responses, autoSave, loading]);
  
  const stats = getCompletionStats();
  
  const onSaveProgress = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      await handleSaveInspection();
      setLastSaved(new Date());
      toast.success("Progresso salvo com sucesso");
    } catch (error: any) {
      toast.error(`Erro ao salvar progresso: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };
  
  const onCompleteInspection = async () => {
    try {
      setSaving(true);
      await completeInspection();
      toast.success("Inspeção finalizada com sucesso");
    } catch (error: any) {
      toast.error(`Erro ao finalizar inspeção: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const onReopenInspection = async () => {
    try {
      setSaving(true);
      await reopenInspection();
      toast.success("Inspeção reaberta com sucesso");
    } catch (error: any) {
      toast.error(`Erro ao reabrir inspeção: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const onViewActionPlan = async (): Promise<void> => {
    toast.info("Funcionalidade de Plano de Ação em desenvolvimento");
    return Promise.resolve();
  };

  const onGenerateReport = async (): Promise<void> => {
    toast.info("Funcionalidade de geração de relatório em desenvolvimento");
    return Promise.resolve();
  };

  const handleSaveSubChecklistResponsesWrapper = async (
    subChecklistId: string, 
    responses: Record<string, any>
  ): Promise<void> => {
    try {
      await handleSaveSubChecklistResponses(subChecklistId, responses);
      toast.success("Sub-checklist salvo com sucesso");
    } catch (error: any) {
      toast.error(`Erro ao salvar sub-checklist: ${error.message || 'Erro desconhecido'}`);
    }
  };
  
  if (error) {
    return (
      <InspectionError 
        error={error} 
        detailedError={detailedError} 
        refreshData={refreshData}
      />
    );
  }
  
  return (
    <InspectionLayout
      loading={loading}
      inspection={inspection}
      company={company}
      responsible={responsible}
      questions={questions || []}
      responses={responses}
      groups={groups || []}
      subChecklists={subChecklists}
      currentGroupId={currentGroupId}
      filteredQuestions={filteredQuestions}
      stats={stats}
      saving={saving}
      autoSave={autoSave}
      lastSaved={lastSaved}
      setAutoSave={setAutoSave}
      setCurrentGroupId={setCurrentGroupId}
      onSaveProgress={onSaveProgress}
      onCompleteInspection={onCompleteInspection}
      onReopenInspection={onReopenInspection}
      onViewActionPlan={onViewActionPlan}
      onGenerateReport={onGenerateReport}
      refreshData={refreshData}
      onResponseChange={handleResponseChange}
      onSaveSubChecklistResponses={handleSaveSubChecklistResponsesWrapper}
    />
  );
}
