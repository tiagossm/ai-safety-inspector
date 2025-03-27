
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useInspectionData } from "@/hooks/inspection";
import { toast } from "sonner";
import { InspectionError } from "@/components/inspection/execution/InspectionError";
import { InspectionLayout } from "@/components/inspection/execution/InspectionLayout";

export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const {
    loading,
    inspection,
    questions,
    responses,
    groups,
    company,
    responsible,
    subChecklists,
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    getCompletionStats,
    error,
    detailedError,
    refreshData,
    completeInspection,
    reopenInspection
  } = useInspectionData(id);
  
  // Set default group when groups are loaded
  useEffect(() => {
    if (groups.length > 0 && !currentGroupId) {
      setCurrentGroupId(groups[0].id);
      console.log(`Setting initial group to ${groups[0].id} (${groups[0].title})`);
    }
  }, [groups, currentGroupId]);

  // Auto-save timer
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        onSaveProgress();
      }, 60000); // Auto-save every minute
      
      return () => clearTimeout(timer);
    }
  }, [responses, autoSave]);
  
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

  // Fix: Add Promise return type to these functions
  const onViewActionPlan = async (): Promise<void> => {
    toast.info("Funcionalidade de Plano de Ação em desenvolvimento");
    return Promise.resolve();
  };

  const onGenerateReport = async (): Promise<void> => {
    toast.info("Funcionalidade de geração de relatório em desenvolvimento");
    return Promise.resolve();
  };

  // Fix: Create a wrapper function that converts Promise<boolean> to Promise<void>
  const handleSaveSubChecklistResponsesWrapper = async (
    subChecklistId: string, 
    responses: Record<string, any>
  ): Promise<void> => {
    await handleSaveSubChecklistResponses(subChecklistId, responses);
    // Don't return the boolean, just resolve the promise without a value
    return Promise.resolve();
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
      questions={questions}
      responses={responses}
      groups={groups}
      subChecklists={subChecklists}
      currentGroupId={currentGroupId}
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
