
import React from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { SimpleQuestionList } from "./SimpleQuestionList";
import { MediaToggle } from "./MediaToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ChecklistQuestionList() {
  const {
    questions,
    enableAllMedia,
    isSubmitting,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleDragEnd,
    toggleAllMediaOptions
  } = useChecklistEditor();

  // Enhanced add question for simple mode
  const handleAddQuestionSimple = () => {
    handleAddQuestion("default");
  };

  // Handle adding sub-questions
  const handleAddSubQuestion = (parentId: string) => {
    const parentQuestion = questions.find(q => q.id === parentId);
    if (parentQuestion) {
      const newId = `new-${Date.now()}`;
      const siblingSubQuestions = questions.filter(q => q.parentQuestionId === parentId);
      const order = questions.length + siblingSubQuestions.length;

      const newSubQuestion = {
        id: newId,
        text: "",
        responseType: "yes_no" as const,
        isRequired: true,
        order,
        weight: 1,
        allowsPhoto: enableAllMedia,
        allowsVideo: enableAllMedia,
        allowsAudio: enableAllMedia,
        allowsFiles: enableAllMedia,
        groupId: parentQuestion.groupId,
        parentQuestionId: parentId,
        level: (parentQuestion.level || 0) + 1,
        path: `${parentQuestion.path}/${newId}`,
        isConditional: false,
        options: []
      };
      
      handleUpdateQuestion(newSubQuestion);
    }
  };

  // Estatísticas das perguntas
  const questionStats = React.useMemo(() => {
    const validQuestions = questions.filter(q => q.text.trim().length > 0);
    const questionsWithIssues = questions.filter(q => {
      const hasText = q.text.trim().length > 0;
      const requiresOptions = ['multiple_choice', 'dropdown', 'checkboxes'].includes(q.responseType);
      const hasValidOptions = !requiresOptions || (q.options && q.options.length > 0);
      return !hasText || !hasValidOptions || q.weight <= 0;
    });
    
    return {
      total: questions.length,
      valid: validQuestions.length,
      withIssues: questionsWithIssues.length
    };
  }, [questions]);

  return (
    <div className="space-y-6">
      {/* Media Toggle */}
      <MediaToggle 
        enableAllMedia={enableAllMedia}
        onToggle={toggleAllMediaOptions}
      />

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Perguntas do Checklist</CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {questionStats.valid} válidas
                </Badge>
                {questionStats.withIssues > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {questionStats.withIssues} com problemas
                  </Badge>
                )}
                <Badge variant="secondary">
                  Total: {questionStats.total}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Alerta se houver perguntas com problemas */}
          {questionStats.withIssues > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                {questionStats.withIssues} pergunta{questionStats.withIssues > 1 ? 's' : ''} requer{questionStats.withIssues === 1 ? '' : 'm'} atenção antes de salvar o checklist.
              </span>
            </div>
          )}

          <SimpleQuestionList
            questions={questions}
            onAddQuestion={handleAddQuestionSimple}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onDragEnd={handleDragEnd}
            onAddSubQuestion={handleAddSubQuestion}
            enableAllMedia={enableAllMedia}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
