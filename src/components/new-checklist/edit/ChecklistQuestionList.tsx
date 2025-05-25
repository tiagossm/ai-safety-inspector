
import React from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { QuestionItem } from "@/components/new-checklist/question-editor/QuestionItem";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ChecklistQuestionList() {
  const {
    questions,
    groups,
    viewMode,
    setViewMode,
    handleAddQuestion,
    handleAddGroup,
    enableAllMedia,
    toggleAllMediaOptions,
    isSubmitting
  } = useChecklistEditor();

  const defaultGroupQuestions = questions.filter(q => !q.groupId || q.groupId === "default");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Perguntas do Checklist</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-all-media"
                checked={enableAllMedia}
                onCheckedChange={toggleAllMediaOptions}
                disabled={isSubmitting}
              />
              <Label htmlFor="enable-all-media" className="text-sm">
                Ativar mídia em todas
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddGroup()}
                disabled={isSubmitting}
              >
                <Users className="h-4 w-4 mr-2" />
                Adicionar Grupo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddQuestion("default")}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Pergunta
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {defaultGroupQuestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma pergunta adicionada ainda.</p>
            <p className="text-sm">Clique em "Nova Pergunta" para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {defaultGroupQuestions.map((question) => (
              <QuestionItem
                key={question.id}
                question={question}
                onUpdate={useChecklistEditor().handleUpdateQuestion}
                onDelete={useChecklistEditor().handleDeleteQuestion}
                enableAllMedia={enableAllMedia}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
