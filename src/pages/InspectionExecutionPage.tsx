
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { InspectionLayout } from "@/components/inspection/execution/InspectionLayout";
import { InspectionError } from "@/components/inspection/execution/InspectionError";
import { useInspectionFetch } from "@/hooks/inspection/useInspectionFetch";

export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Use the direct inspection fetch hook
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
    subChecklists,
    setResponses,
    refreshData
  } = useInspectionFetch(id);

  // Set initial group when data is loaded
  useEffect(() => {
    if (!loading && !currentGroupId && groups && groups.length > 0) {
      setCurrentGroupId(groups[0].id);
    }
  }, [loading, groups, currentGroupId]);

  // Calculate stats for completion progress
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
    
    // Calculate stats per group
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

  // Get questions filtered by group
  const getFilteredQuestions = (groupId: string | null) => {
    if (!groupId || !questions) return [];
    return questions.filter(q => (q.groupId || 'default-group') === groupId);
  };

  // Handle response changes
  const handleResponseChange = (questionId: string, value: any, additionalData?: any) => {
    if (!responses) return;
    
    setResponses({
      ...responses,
      [questionId]: {
        ...(responses[questionId] || {}),
        value,
        ...(additionalData || {})
      }
    });
  };

  // Save inspection progress
  const handleSaveProgress = async () => {
    if (saving || !id || !inspection) return;
    
    setSaving(true);
    try {
      // Implementation to be completed in future iterations
      // This would call an API to save the inspection responses
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLastSaved(new Date());
      toast.success("Progresso salvo com sucesso");
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast.error(`Erro ao salvar progresso: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle subchecklist responses
  const handleSaveSubChecklistResponses = async (subChecklistId: string, subResponses: Record<string, any>) => {
    if (!id) return;
    
    try {
      // Implementation to be completed in future iterations
      // This would call an API to save the subchecklist responses
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Sub-checklist salvo com sucesso");
      return;
    } catch (error: any) {
      console.error("Error saving sub-checklist:", error);
      toast.error(`Erro ao salvar sub-checklist: ${error.message || 'Erro desconhecido'}`);
      throw error;
    }
  };

  // Complete inspection
  const handleCompleteInspection = async () => {
    if (!id || !inspection) return;
    
    try {
      setSaving(true);
      // Implementation to be completed in future iterations
      // This would call an API to mark the inspection as completed
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Inspeção finalizada com sucesso");
      refreshData();
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      toast.error(`Erro ao finalizar inspeção: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Reopen inspection
  const handleReopenInspection = async () => {
    if (!id || !inspection) return;
    
    try {
      setSaving(true);
      // Implementation to be completed in future iterations
      // This would call an API to reopen the inspection
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Inspeção reaberta com sucesso");
      refreshData();
    } catch (error: any) {
      console.error("Error reopening inspection:", error);
      toast.error(`Erro ao reabrir inspeção: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Mock functions for action plan and report generation
  const handleViewActionPlan = async () => {
    toast.info("Funcionalidade de Plano de Ação em desenvolvimento");
    return Promise.resolve();
  };

  const handleGenerateReport = async () => {
    toast.info("Funcionalidade de geração de relatório em desenvolvimento");
    return Promise.resolve();
  };

  // If ID is invalid
  if (!id) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-medium">ID da inspeção não fornecido</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>Não foi possível carregar a inspeção porque o ID não foi fornecido.</p>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/inspections")}
                className="text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Inspeções
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If there's an error fetching the data
  if (error) {
    return (
      <InspectionError 
        error={error} 
        detailedError={detailedError} 
        refreshData={refreshData}
      />
    );
  }

  // Filter questions by current group
  const filteredQuestions = getFilteredQuestions(currentGroupId);
  
  // Calculate stats
  const stats = calculateStats();

  return (
    <div className="container max-w-7xl mx-auto py-6">
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
        onSaveProgress={handleSaveProgress}
        onCompleteInspection={handleCompleteInspection}
        onReopenInspection={handleReopenInspection}
        onViewActionPlan={handleViewActionPlan}
        onGenerateReport={handleGenerateReport}
        refreshData={refreshData}
        onResponseChange={handleResponseChange}
        onSaveSubChecklistResponses={handleSaveSubChecklistResponses}
      />
    </div>
  );
}
