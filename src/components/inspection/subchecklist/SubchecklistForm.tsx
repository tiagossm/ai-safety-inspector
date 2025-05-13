
import React, { useState } from "react";
import { InspectionQuestion } from "../InspectionQuestion";
import { Button } from "@/components/ui/button";

interface SubchecklistFormProps {
  questions: any[];
  responses: Record<string, any>;
  onSave: (responses: Record<string, any>) => Promise<void>;
}

export function SubchecklistForm({ 
  questions, 
  responses,
  onSave
}: SubchecklistFormProps) {
  const [localResponses, setLocalResponses] = useState<Record<string, any>>(responses || {});
  const [saving, setSaving] = useState(false);

  const handleResponseChange = (questionId: string, data: any) => {
    setLocalResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        ...data,
        questionId // Store the question ID within the response
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await onSave(localResponses);
      setSaving(false);
    } catch (error) {
      console.error("Error saving subchecklist responses:", error);
      setSaving(false);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Nenhuma pergunta disponível neste sub-checklist</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id || `question-${index}`} className="border rounded-md p-4 bg-background">
            <InspectionQuestion
              question={question}
              index={index}
              response={localResponses[question.id] || {}}
              onResponseChange={(data) => handleResponseChange(question.id, data)}
              allQuestions={questions}
              numberLabel={`${index + 1}`}
              isSubQuestion={true}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar Respostas"}
        </Button>
      </div>
    </div>
  );
}
