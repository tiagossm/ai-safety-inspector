
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "@/components/new-checklist/edit/QuestionEditor";

interface ManualModeContentProps {
  questions: ChecklistQuestion[];
  onAddQuestion: (groupId: string) => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
}

export function ManualModeContent({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion
}: ManualModeContentProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Perguntas do Checklist</span>
            <Button 
              onClick={() => onAddQuestion("")}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma pergunta adicionada ainda</p>
              <p className="text-sm">Clique em "Adicionar Pergunta" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Pergunta {index + 1}
                    </span>
                  </div>
                  <QuestionEditor
                    question={question}
                    onUpdate={onUpdateQuestion}
                    onDelete={onDeleteQuestion}
                    enableAllMedia={false}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
