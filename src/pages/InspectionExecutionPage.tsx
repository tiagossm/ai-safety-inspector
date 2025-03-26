
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { InspectionDetailsCard } from "@/components/inspection/InspectionDetails";
import { InspectionCompletion } from "@/components/inspection/InspectionCompletion";
import { QuestionGroups } from "@/components/inspection/QuestionGroups";
import { QuestionsPanel } from "@/components/inspection/QuestionsPanel";

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
    getCompletionStats
  } = useInspectionData(id);
  
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
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <InspectionDetailsCard 
            loading={loading} 
            inspection={inspection} 
            company={company} 
            responsible={responsible} 
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
            disabled={saving}
            onClick={onSaveInspection}
          >
            {saving ? "Salvando..." : "Salvar Inspeção"}
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
        </div>
      </div>
    </div>
  );
}
