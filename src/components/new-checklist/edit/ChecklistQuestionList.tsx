
import React, { useState } from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { SimpleQuestionList } from "./SimpleQuestionList";
import { QuestionGroupsList } from "./QuestionGroupsList";
import { MediaToggle } from "./MediaToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, List, Folder, AlertCircle, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function ChecklistQuestionList() {
  const {
    questions,
    groups,
    questionsByGroup,
    nonEmptyGroups,
    enableAllMedia,
    isSubmitting,
    handleAddGroup,
    handleUpdateGroup,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleDeleteGroup,
    handleDragEnd,
    toggleAllMediaOptions
  } = useChecklistEditor();

  const [viewMode, setViewMode] = useState<"simple" | "grouped">("simple");

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

  // Handle adding questions for simple mode
  const handleAddQuestionSimple = () => {
    // Ensure we have a default group
    const defaultGroupId = groups.length > 0 ? groups[0].id : "default";
    handleAddQuestion(defaultGroupId);
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
            
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "simple" | "grouped")}>
                <TabsList>
                  <TabsTrigger value="simple" className="flex items-center gap-1">
                    <List className="h-4 w-4" />
                    Lista Simples
                  </TabsTrigger>
                  <TabsTrigger value="grouped" className="flex items-center gap-1">
                    <Folder className="h-4 w-4" />
                    Agrupado
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {viewMode === "grouped" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddGroup}
                  disabled={isSubmitting}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Novo Grupo
                </Button>
              )}
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

          {viewMode === "simple" ? (
            <SimpleQuestionList
              questions={questions}
              onAddQuestion={handleAddQuestionSimple}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onDragEnd={handleDragEnd}
              enableAllMedia={enableAllMedia}
              isSubmitting={isSubmitting}
            />
          ) : (
            <QuestionGroupsList
              groups={nonEmptyGroups}
              questions={questions}
              questionsByGroup={questionsByGroup}
              onUpdateGroup={handleUpdateGroup}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onDeleteGroup={handleDeleteGroup}
              onAddSubQuestion={handleAddSubQuestion}
              enableAllMedia={enableAllMedia}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Empty State */}
          {questions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium mb-2">Nenhuma pergunta adicionada ainda</p>
              <p className="text-sm mb-4">
                {viewMode === "grouped" 
                  ? "Adicione um grupo para começar a organizar suas perguntas."
                  : "Clique no botão abaixo para adicionar sua primeira pergunta."
                }
              </p>
              {viewMode === "simple" && (
                <Button onClick={handleAddQuestionSimple} disabled={isSubmitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeira pergunta
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
