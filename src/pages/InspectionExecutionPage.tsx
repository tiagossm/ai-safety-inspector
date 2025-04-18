
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInspectionData } from "@/hooks/inspection";
import { toast } from "sonner";
import { InspectionError } from "@/components/inspection/execution/InspectionError";
import { InspectionLayout } from "@/components/inspection/execution/InspectionLayout";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";

export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  useEffect(() => {
    if (id === "new") {
      navigate("/inspections/new");
      return;
    }
  }, [id, navigate]);
  
  const skipLoading = id === "new";
  
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
    getFilteredQuestions,
    error,
    detailedError,
    refreshData,
    completeInspection,
    reopenInspection
  } = useInspectionData(skipLoading ? undefined : id);
  
  // Set initial group when data is loaded
  useEffect(() => {
    if (!loading && groups && groups.length > 0 && !currentGroupId) {
      const firstGroupId = groups[0].id;
      console.log(`Setting initial group to ${firstGroupId} (${groups[0].title})`);
      setCurrentGroupId(firstGroupId);
    }
  }, [groups, currentGroupId, loading]);

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
  const filteredQuestions = getFilteredQuestions(currentGroupId);
  
  // Debug logging
  useEffect(() => {
    if (!loading) {
      console.log(`Filtered questions for group ${currentGroupId}: ${filteredQuestions.length} of ${questions.length}`);
      console.log(`Available groups: ${groups.map(g => g.id).join(', ')}`);
      
      if (questions && questions.length > 0) {
        const groupCounts = questions.reduce((acc: Record<string, number>, q) => {
          const groupId = q.groupId || 'no-group';
          acc[groupId] = (acc[groupId] || 0) + 1;
          return acc;
        }, {});
        
        console.log('Questions per group:', groupCounts);
      }
    }
  }, [currentGroupId, filteredQuestions, questions, groups, loading]);
  
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
    return Promise.resolve();
  };

  if (id === "new") {
    return null;
  }

  if (error) {
    return (
      <InspectionError 
        error={error} 
        detailedError={detailedError} 
        refreshData={refreshData}
      />
    );
  }
  
  console.log(`Execution Page: Loaded ${questions?.length || 0} questions, ${groups?.length || 0} groups`);
  if (currentGroupId) {
    const questionsInGroup = questions?.filter(q => q.groupId === currentGroupId) || [];
    console.log(`Current group ${currentGroupId} has ${questionsInGroup.length} questions`);
  }
  
  return (
    <>
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
      <FloatingNavigation threshold={400} />
    </>
  );
}
