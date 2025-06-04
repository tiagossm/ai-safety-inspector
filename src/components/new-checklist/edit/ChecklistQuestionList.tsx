
import React, { useState } from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { SimpleQuestionList } from "./SimpleQuestionList";
import { QuestionGroupsList } from "./QuestionGroupsList";
import { MediaToggle } from "./MediaToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, List, Folder } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <CardTitle>Perguntas do Checklist</CardTitle>
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

          {/* Empty State - only for grouped mode */}
          {viewMode === "grouped" && questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma pergunta adicionada ainda.</p>
              <p className="text-sm">Adicione um grupo para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
