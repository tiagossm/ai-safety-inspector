import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw, ArrowLeft, ClipboardList } from "lucide-react";
import { InspectionLayout } from "@/components/inspection/execution/InspectionLayout";
import { InspectionError } from "@/components/inspection/execution/InspectionError";
import { InspectionHeaderForm } from "@/components/inspection/execution/InspectionHeaderForm";
import { LoadingInspectionState } from "@/components/inspection/execution/LoadingInspectionState";
import { useInspectionFetch } from "@/hooks/inspection/useInspectionFetch";
import { useInspectionStatus } from "@/hooks/inspection/useInspectionStatus";
import { useResponseHandling } from "@/hooks/inspection/useResponseHandling";
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

  // Get inspection status management functions
  const { completeInspection, reopenInspection } = useInspectionStatus(id);

  // Get response handling functions
  const {
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    handleMediaUpload,
    handleMediaChange
  } = useResponseHandling(id, setResponses);

  // Get action plans functions
  const {
    plansByQuestion,
    stats: actionPlanStats,
    loading: loadingActionPlans,
    saveActionPlan,
    refreshPlans
  } = useActionPlans(id);
  
  // Add sub-checklist dialog hook
  const {
    subChecklistDialogOpen,
    setSubChecklistDialogOpen,
    currentSubChecklist,
    currentParentQuestionId,
    savingSubChecklist,
    handleOpenSubChecklist,
    handleSaveSubChecklistResponses: saveSubChecklistResponses,
    safeParseResponse
  } = useSubChecklistDialog(responses, handleResponseChange, handleSaveSubChecklistResponses);

  // Set initial group when data is loaded
  React.useEffect(() => {
    if (!loading && !currentGroupId && groups && groups.length > 0) {
      setCurrentGroupId(groups[0].id);
    }
  }, [loading, groups, currentGroupId]);

  // Calculate if the inspection is editable
  const isInspectionEditable = () => {
    return inspection && [INSPECTION_STATUSES.PENDING, INSPECTION_STATUSES.IN_PROGRESS].includes(inspection.status);
  };

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

  // Save inspection progress
  const handleSaveProgress = async () => {
    if (saving || !id || !inspection) return;
    
    setSaving(true);
    try {
      await handleSaveInspection(responses, inspection);
      setLastSaved(new Date());
      toast.success("Progresso salvo com sucesso");
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast.error(`Erro ao salvar progresso: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Complete inspection and generate PDF
  const handleCompleteInspection = async () => {
    if (!id || !inspection) return;
    
    try {
      setSaving(true);
      // First save all responses
      await handleSaveInspection(responses, inspection);
      
      // Complete the inspection
      await completeInspection(inspection);
      
      // Generate PDF report
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
        
        // Refresh data to get updated status
        await refreshData();
        
        // Also refresh action plans
        await refreshPlans();
        
        // Navigate to inspection page after completion and report generation
        navigate(`/inspections/${id}`);
      } catch (pdfError: any) {
        console.error("Error generating PDF:", pdfError);
        toast.error(`Erro ao gerar relatório: ${pdfError.message || 'Erro desconhecido'}`);
        
        // Even if PDF fails, we've completed the inspection, so navigate back
        navigate(`/inspections/${id}`);
      }
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
      const updatedInspection = await reopenInspection(inspection);
      toast.success("Inspeção reaberta com sucesso");
      refreshData();
    } catch (error: any) {
      console.error("Error reopening inspection:", error);
      toast.error(`Erro ao reabrir inspeção: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle inspection form save
  const handleInspectionDataSave = () => {
    refreshData();
  };

  // Navigate to action plans page
  const handleViewActionPlan = async () => {
    navigate(`/inspections/${id}/action-plans`);
    return Promise.resolve();
  };

  // Function for report generation
  const handleGenerateReport = async () => {
    try {
      toast.info("Gerando relatório PDF...");
      const reportOptions = { 
        inspectionId: id!, 
        includeImages: true, 
        includeComments: true, 
        includeActionPlans: true,
        format: 'pdf' as 'pdf'
      };
      
      const pdfUrl = await generateInspectionPDF(reportOptions);
      toast.success("Relatório gerado com sucesso");
      
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(`Erro ao gerar relatório: ${error.message || 'Erro desconhecido'}`);
      return Promise.reject(error);
    }
  };

  // Handle opening sub-checklist
  const onOpenSubChecklist = (questionId: string) => {
    if (subChecklists && subChecklists[questionId]) {
      handleOpenSubChecklist(questionId, subChecklists);
    } else {
      toast.error("Sub-checklist não encontrado");
    }
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

  // Show loading state
  if (loading) {
    return <LoadingInspectionState />;
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

  // Check if the minimum required data is available to show the checklist
  const hasRequiredData = inspection && company?.id && responsible?.id;

  // Calculate action plan stats - significant non-conformities
  const hasActionPlans = Object.keys(plansByQuestion).length > 0;
  const pendingActionPlans = actionPlanStats?.pending || 0;

  // Get current sub-checklist responses if available
  const currentSubChecklistResponses = currentParentQuestionId && responses[currentParentQuestionId]?.subChecklistResponses 
    ? safeParseResponse(responses[currentParentQuestionId].subChecklistResponses) 
    : {};

  return (
    <div className="container max-w-7xl mx-auto py-6">
      {/* Inspection Header Form */}
      {inspection && (
        <div className="mb-6">
          <InspectionHeaderForm
            inspectionId={id}
            inspection={inspection}
            company={company}
            responsible={responsible}
            isEditable={isInspectionEditable()}
            onSave={handleInspectionDataSave}
          />
        
          {/* Show action plans summary if there are any */}
          {hasActionPlans && (
            <div className="mt-4 flex items-start">
              <div className="flex-1">
                <div className="rounded-md border p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClipboardList className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-medium">Action Plans</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/inspections/${id}/action-plans`)}
                    >
                      View All Action Plans
                    </Button>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{actionPlanStats.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{actionPlanStats.pending}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{actionPlanStats.inProgress}</div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{actionPlanStats.completed}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show checklist only if minimum required data is available */}
      {hasRequiredData ? (
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
          setResponses={setResponses}
          onResponseChange={handleResponseChange}
          onMediaChange={handleMediaChange}
          onMediaUpload={handleMediaUpload}
          onSaveSubChecklistResponses={handleSaveSubChecklistResponses}
          plansByQuestion={plansByQuestion}
          onSaveActionPlan={saveActionPlan}
          onOpenSubChecklist={onOpenSubChecklist}
        />
      ) : (
        !loading && (
          <Card className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Dados Obrigatórios Pendentes</h2>
            <p className="text-muted-foreground mb-4">
              Por favor, preencha os dados obrigatórios da inspeção acima para visualizar o checklist.
            </p>
          </Card>
        )
      )}
      
      {/* Sub-checklist dialog */}
      <SubChecklistDialog
        open={subChecklistDialogOpen}
        onOpenChange={setSubChecklistDialogOpen}
        subChecklist={currentSubChecklist}
        subChecklistQuestions={currentSubChecklist?.questions || []}
        currentResponses={currentSubChecklistResponses}
        onSaveResponses={saveSubChecklistResponses}
        saving={savingSubChecklist}
      />
    </div>
  );
}
