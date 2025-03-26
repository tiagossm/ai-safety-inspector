
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { InspectionDetailsCard } from "@/components/inspection/InspectionDetails";
import { InspectionCompletion } from "@/components/inspection/InspectionCompletion";
import { QuestionGroups } from "@/components/inspection/QuestionGroups";
import { QuestionsPanel } from "@/components/inspection/QuestionsPanel";
import { AlertCircle, ArrowPathIcon, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
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
    refreshData
  } = useInspectionData(id);
  
  // Set default group when groups are loaded
  useEffect(() => {
    if (groups.length > 0 && !currentGroupId) {
      setCurrentGroupId(groups[0].id);
    }
  }, [groups, currentGroupId]);
  
  const filteredQuestions = getFilteredQuestions(currentGroupId);
  const stats = getCompletionStats();
  
  const onSaveInspection = async () => {
    setSaving(true);
    await handleSaveInspection();
    setSaving(false);
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <InspectionHeader loading={loading} inspection={inspection} />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar inspeção</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={refreshData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
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
          
          <Button
            className="w-full"
            disabled={saving || loading}
            onClick={onSaveInspection}
          >
            {saving ? "Salvando..." : "Salvar Inspeção"}
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={refreshData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar dados
          </Button>
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
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sem perguntas disponíveis</AlertTitle>
              <AlertDescription>
                Não foram encontradas perguntas para este checklist.
                Tente atualizar os dados ou verifique se o checklist possui perguntas cadastradas.
              </AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={refreshData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar dados
              </Button>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
