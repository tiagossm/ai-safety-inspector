
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInspectionData } from "@/hooks/inspection";
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { InspectionDetailsCard } from "@/components/inspection/InspectionDetails";
import { InspectionCompletion } from "@/components/inspection/InspectionCompletion";
import { QuestionGroups } from "@/components/inspection/QuestionGroups";
import { QuestionsPanel } from "@/components/inspection/QuestionsPanel";
import { AlertCircle, RefreshCw, Save, CheckCircle2, FileText, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
    subChecklists,
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    getFilteredQuestions,
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
  
  const filteredQuestions = getFilteredQuestions(currentGroupId);
  console.log(`Filtered questions for group ${currentGroupId}: ${filteredQuestions.length}`);
  
  const stats = getCompletionStats();
  console.log(`Completion stats: ${stats.answered}/${stats.total} (${stats.percentage}%)`);
  
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
    if (stats.percentage < 100) {
      if (!window.confirm("A inspeção não está 100% completa. Deseja finalizar mesmo assim?")) {
        return;
      }
    }
    
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

  const onViewActionPlan = () => {
    toast.info("Funcionalidade de Plano de Ação em desenvolvimento");
    // Future implementation: navigate to action plan page
  };

  const onGenerateReport = () => {
    toast.info("Funcionalidade de geração de relatório em desenvolvimento");
    // Future implementation: generate PDF report
  };

  const getStatusLabel = (status?: string) => {
    switch(status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em andamento';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-4">
          <h1 className="text-xl font-medium text-gray-800">Inspeção</h1>
          <p className="text-sm text-gray-500">Execução de checklist</p>
        </div>
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-medium">Erro ao carregar inspeção</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>{error}</p>
            {detailedError && (
              <div className="px-4 py-3 bg-red-50 border border-red-100 rounded text-sm">
                <p className="flex items-center font-medium text-red-800"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> Detalhes do erro:</p>
                <p className="mt-1 text-red-700">
                  {detailedError.message || JSON.stringify(detailedError)}
                </p>
                {detailedError.hint && <p className="mt-1 text-red-700">Sugestão: {detailedError.hint}</p>}
                {detailedError.details && <p className="mt-1 text-red-700">Detalhes: {detailedError.details}</p>}
              </div>
            )}
            <div className="flex space-x-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/inspections")}
                className="text-sm"
              >
                Voltar para Inspeções
              </Button>
              <Button 
                variant="default" 
                onClick={refreshData}
                className="text-sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container py-4 max-w-7xl mx-auto">
      <InspectionHeader 
        loading={loading} 
        inspection={{
          ...inspection,
          statusLabel: getStatusLabel(inspection?.status)
        }} 
      />
      
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
            <div className="flex items-center mb-2 justify-between bg-muted/40 p-2 rounded-md">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoSave"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
                <Label htmlFor="autoSave" className="text-sm">Auto-salvar</Label>
              </div>
              
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Último: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            
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
                <ArrowLeftRight className="h-3.5 w-3.5 ml-1.5" />
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
            onSaveSubChecklistResponses={handleSaveSubChecklistResponses}
            subChecklists={subChecklists}
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
