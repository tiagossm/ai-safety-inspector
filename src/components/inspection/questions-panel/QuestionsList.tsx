
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

interface QuestionsListProps {
  questions: any[];
  responses: Record<string, any>;
  allQuestions: any[];
  onResponseChange: (questionId: string, data: any) => void;
  onOpenSubChecklist?: (questionId: string) => void;
  subChecklists: Record<string, any>;
}

export function QuestionsList({
  questions,
  responses,
  allQuestions,
  onResponseChange,
  onOpenSubChecklist,
  subChecklists
}: QuestionsListProps) {
  // State to track expanded sub-checklists
  const [expandedSubChecklists, setExpandedSubChecklists] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Log the questions and available subChecklists for debugging
    console.log(`QuestionsList: Rendering ${questions?.length || 0} questions`);
    if (Object.keys(subChecklists).length > 0) {
      console.log("Available subChecklists:", Object.keys(subChecklists));
    }
    
    // Check if all questions have groupId
    const questionsWithoutGroup = questions?.filter(q => !q.groupId) || [];
    if (questionsWithoutGroup.length > 0) {
      console.warn(`Found ${questionsWithoutGroup.length} questions without groupId`);
    }
  }, [questions, subChecklists]);
  
  // Helper function to toggle sub-checklist expanded state
  const toggleSubChecklist = (questionId: string) => {
    console.log("Toggling sub-checklist for question:", questionId);
    setExpandedSubChecklists(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-10 w-10 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">Nenhuma pergunta disponível neste grupo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={question.id} className="border rounded-md mb-4">
          <div className="p-4">
            {/* Question header */}
            <div className="flex justify-between">
              <div className="font-medium mb-2">
                {index + 1}. {question.text || question.pergunta}
              </div>
              {(question.obrigatorio || question.isRequired) && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  Obrigatório
                </span>
              )}
            </div>
            
            {/* Response inputs */}
            <div className="mt-3">
              {(question.tipo_resposta === 'yes_no' || question.responseType === 'yes_no') ? (
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant={responses[question.id]?.value === "sim" ? "default" : "outline"}
                    onClick={() => onResponseChange(question.id, { value: "sim" })}
                    className={responses[question.id]?.value === "sim" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                  >
                    Sim
                  </Button>
                  <Button 
                    size="sm"
                    variant={responses[question.id]?.value === "não" ? "default" : "outline"}
                    onClick={() => onResponseChange(question.id, { value: "não" })}
                    className={responses[question.id]?.value === "não" ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                  >
                    Não
                  </Button>
                  <Button 
                    size="sm"
                    variant={responses[question.id]?.value === "n/a" ? "default" : "outline"}
                    onClick={() => onResponseChange(question.id, { value: "n/a" })}
                    className={responses[question.id]?.value === "n/a" ? "bg-gray-500 hover:bg-gray-600 text-white" : ""}
                  >
                    N/A
                  </Button>
                </div>
              ) : (
                <textarea 
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  placeholder="Digite sua resposta..."
                  value={responses[question.id]?.value || ""}
                  onChange={(e) => onResponseChange(question.id, { value: e.target.value })}
                />
              )}
            </div>
            
            {/* Comment section */}
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-600 mb-1">Comentário:</p>
              <textarea 
                className="w-full border rounded p-2 text-sm"
                rows={2}
                placeholder="Adicione um comentário (opcional)"
                value={responses[question.id]?.comment || ""}
                onChange={(e) => onResponseChange(question.id, { 
                  value: responses[question.id]?.value, 
                  comment: e.target.value
                })}
              />
            </div>

            {/* Sub-checklist controls - if applicable */}
            {(question.hasSubChecklist || question.has_subchecklist || !!question.subChecklistId || !!question.sub_checklist_id) && (
              <div className="mt-3 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSubChecklist(question.id)}
                  className="flex items-center text-primary"
                >
                  {expandedSubChecklists[question.id] ? 
                    <ChevronDown className="h-4 w-4 mr-1" /> : 
                    <ChevronRight className="h-4 w-4 mr-1" />}
                  {expandedSubChecklists[question.id] ? "Ocultar sub-checklist" : "Mostrar sub-checklist"}
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
      
      <div className="pt-4 flex justify-end">
        <Button
          variant="ghost"
          onClick={() => {
            toast.info("Próximo grupo será implementado em versões futuras");
          }}
        >
          Próximo Grupo
        </Button>
      </div>
    </div>
  );
}
