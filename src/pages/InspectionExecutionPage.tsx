
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InspectionError } from "@/components/inspection/execution/InspectionError";
import { InspectionLayout } from "@/components/inspection/execution/InspectionLayout";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { InspectionDataProvider, useInspectionDataContext } from "@/components/inspection/execution/InspectionDataProvider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

// Componente principal da página de execução de inspeção
export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirecionar para página de criação de inspeção se não houver ID
  useEffect(() => {
    if (!id || id === "new") {
      console.log("No inspection ID provided or ID is 'new', redirecting to creation page");
      navigate("/inspections/new");
    } else {
      setIsLoading(false);
    }
  }, [id, navigate]);
  
  // Se estamos redirecionando ou sem ID, não renderizar nada
  if (isLoading || !id || id === "new") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary fallback={<NetworkErrorScreen id={id} />}>
      <InspectionDataProvider inspectionId={id}>
        <InspectionView />
        <FloatingNavigation threshold={400} />
      </InspectionDataProvider>
    </ErrorBoundary>
  );
}

function NetworkErrorScreen({ id }: { id: string }) {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-3xl mx-auto py-12">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-medium">Erro de conexão</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>Não foi possível conectar ao servidor para buscar os dados da inspeção. Verifique sua conexão com a internet.</p>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/inspections")}
              className="text-sm"
            >
              Voltar para Inspeções
            </Button>
            <Button 
              variant="default" 
              onClick={() => window.location.reload()}
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

// Componente separado para visualização da inspeção
function InspectionView() {
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Usar o hook de contexto para acessar os dados da inspeção
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
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    getCompletionStats,
    getFilteredQuestions,
    refreshData,
    completeInspection,
    reopenInspection,
    setCurrentGroupId
  } = useInspectionDataContext();
  
  // Obter perguntas filtradas para o grupo atual de forma memorizada
  const filteredQuestions = useMemo(() => {
    if (!getFilteredQuestions || !currentGroupId) return [];
    return getFilteredQuestions(currentGroupId);
  }, [getFilteredQuestions, currentGroupId, questions]);
  
  // Auto-save configuration
  useEffect(() => {
    if (autoSave && !loading && handleSaveInspection) {
      const timer = setTimeout(() => {
        onSaveProgress();
      }, 60000); // Auto-save every minute
      
      return () => clearTimeout(timer);
    }
  }, [responses, autoSave, loading, handleSaveInspection]);
  
  // Obter estatísticas de conclusão
  const stats = useMemo(() => {
    if (!getCompletionStats) return { percentage: 0, answered: 0, total: 0 };
    return getCompletionStats();
  }, [getCompletionStats, responses, questions]);
  
  const onSaveProgress = async () => {
    if (saving || !handleSaveInspection) return;
    
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
  
  const onCompleteInspection = async () => {
    if (!completeInspection) return;
    
    try {
      setSaving(true);
      await completeInspection();
      toast.success("Inspeção finalizada com sucesso");
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      toast.error(`Erro ao finalizar inspeção: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const onReopenInspection = async () => {
    if (!reopenInspection) return;
    
    try {
      setSaving(true);
      await reopenInspection();
      toast.success("Inspeção reaberta com sucesso");
    } catch (error: any) {
      console.error("Error reopening inspection:", error);
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
    if (!handleSaveSubChecklistResponses) return;
    
    try {
      await handleSaveSubChecklistResponses(subChecklistId, responses);
      toast.success("Sub-checklist salvo com sucesso");
    } catch (error: any) {
      console.error("Error saving sub-checklist:", error);
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

// Componente para capturar erros
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error) {
    console.error("Error caught by boundary:", error);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}
