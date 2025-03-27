
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { InspectionDetailsCard } from "@/components/inspection/InspectionDetails";
import { InspectionCompletion } from "@/components/inspection/InspectionCompletion";
import { QuestionGroups } from "@/components/inspection/QuestionGroups";
import { QuestionsPanel } from "@/components/inspection/QuestionsPanel";
import { AlertCircle, RefreshCw, Save, CheckCircle2, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    handleResponseChange,
    handleSaveInspection,
    getFilteredQuestions,
    getCompletionStats,
    error,
    refreshData,
    completeInspection,
    reopenInspection
  } = useInspectionData(id);
  
  // Set default group when groups are loaded
  useEffect(() => {
    if (groups.length > 0 && !currentGroupId) {
      setCurrentGroupId(groups[0].id);
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
  
  const filteredQuestions = getFilteredQuestions(currentGroupId);
  const stats = getCompletionStats();
  
  const onSaveProgress = async () => {
    setSaving(true);
    try {
      await handleSaveInspection();
      setLastSaved(new Date());
      toast.success("Progresso salvo com sucesso");
    } catch (error) {
      toast.error("Erro ao salvar progresso");
    } finally {
      setSaving(false);
    }
  };
  
  const onCompleteInspection = async () => {
    if (stats.percentage < 100) {
      if (!window.confirm("A inspeção não está 100% completa. Deseja finalizar mesmo assim?")) {
        return;
      }
    }
    
    try {
      setSaving(true);
      await completeInspection();
      toast.success("Inspeção finalizada com sucesso");
    } catch (error) {
      toast.error("Erro ao finalizar inspeção");
    } finally {
      setSaving(false);
    }
  };

  const onReopenInspection = async () => {
    try {
      setSaving(true);
      await reopenInspection();
      toast.success("Inspeção reaberta com sucesso");
    } catch (error) {
      toast.error("Erro ao reabrir inspeção");
    } finally {
      setSaving(false);
    }
  };

  const onViewActionPlan = () => {
    toast.info("Funcionalidade de Plano de Ação em desenvolvimento");
    // Future implementation: navigate to action plan page
  };

  const onGenerateReport = () => {
    toast.info("Funcionalidade de geração de relatório em desenvolvimento");
    // Future implementation: generate PDF report
  };
  
  return (
    <div className="container py-4 max-w-7xl mx-auto">
      <InspectionHeader loading={loading} inspection={inspection} />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-medium">Erro ao carregar inspeção</AlertTitle>
          <AlertDescription className="text-xs">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-xs" 
              onClick={refreshData}
            >
              <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <InspectionDetailsCard 
            loading={loading} 
            inspection={inspection} 
            company={company} 
            responsible={responsible}
            onRefresh={refreshData}
          />
          
          <InspectionCompletion loading={loading} stats={stats} />
          
          {groups.length > 0 && (
            <QuestionGroups 
              groups={groups} 
              currentGroupId={currentGroupId} 
              onGroupChange={setCurrentGroupId} 
            />
          )}
          
          <div className="space-y-2">
            <Button
              className="w-full text-sm"
              disabled={saving || loading}
              onClick={onSaveProgress}
            >
              {saving ? "Salvando..." : "Salvar Progresso"}
              <Save className="h-3.5 w-3.5 ml-1.5" />
            </Button>
            
            {inspection?.status !== 'completed' ? (
              <Button
                variant="default"
                className="w-full text-sm"
                disabled={saving || loading}
                onClick={onCompleteInspection}
              >
                Finalizar Inspeção
                <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full text-sm"
                disabled={saving || loading}
                onClick={onReopenInspection}
              >
                Reabrir Inspeção
              </Button>
            )}
            
            <Button
              variant="outline"
              className="w-full text-sm"
              disabled={loading}
              onClick={onViewActionPlan}
            >
              Plano de Ação
            </Button>
            
            <Button
              variant="outline"
              className="w-full text-sm"
              disabled={loading}
              onClick={onGenerateReport}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Gerar Relatório
            </Button>
            
            <Button
              variant="outline"
              className="w-full text-sm"
              disabled={loading}
              onClick={refreshData}
            >
              <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" />
              Atualizar dados
            </Button>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <QuestionsPanel 
            loading={loading}
            currentGroupId={currentGroupId}
            filteredQuestions={filteredQuestions}
            questions={questions}
            responses={responses}
            groups={groups}
            onResponseChange={handleResponseChange}
          />
          
          {!loading && questions.length === 0 && (
            <Alert className="mt-3">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <AlertTitle className="text-sm font-medium">Sem perguntas disponíveis</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed">
                Não foram encontradas perguntas para este checklist.
                Tente atualizar os dados ou verifique se o checklist possui perguntas cadastradas.
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs" 
                  onClick={refreshData}
                >
                  <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" />
                  Atualizar dados
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
