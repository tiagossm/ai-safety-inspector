
import React, { useState } from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QuestionCard } from "../question-editor/QuestionCard";

export function ChecklistQuestionList() {
  const { 
    questions, 
    handleAddQuestion, 
    handleUpdateQuestion, 
    handleDeleteQuestion,
    viewMode,
    questionsByGroup,
    nonEmptyGroups,
    enableAllMedia,
    toggleAllMediaOptions
  } = useChecklistEditor();

  const handleMediaToggle = (checked: boolean) => {
    toggleAllMediaOptions(checked);
  };

  if (viewMode === "flat") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Perguntas</h3>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="enable-all-media"
              checked={enableAllMedia}
              onCheckedChange={handleMediaToggle}
              className={enableAllMedia ? "data-[state=checked]:bg-green-500" : ""}
            />
            <Label htmlFor="enable-all-media" className="text-sm">
              Habilitar todas mídias
            </Label>
          </div>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhuma pergunta adicionada. Clique em "Adicionar Pergunta" para começar.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions
              .sort((a, b) => a.order - b.order)
              .map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  enableAllMedia={enableAllMedia}
                />
              ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={() => handleAddQuestion("default")}
          >
            Adicionar Pergunta
          </button>
        </div>
      </div>
    );
  }

  // Grouped mode
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Grupos de Perguntas</h3>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="enable-all-media" 
            checked={enableAllMedia}
            onCheckedChange={handleMediaToggle}
            className={enableAllMedia ? "data-[state=checked]:bg-green-500" : ""}
          />
          <Label htmlFor="enable-all-media" className="text-sm">
            Habilitar todas mídias
          </Label>
        </div>
      </div>

      {nonEmptyGroups.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nenhum grupo com perguntas. Adicione perguntas para começar.
          </CardContent>
        </Card>
      ) : (
        nonEmptyGroups.map((group) => {
          const groupQuestions = questionsByGroup.get(group.id) || [];
          return (
            <div key={group.id} className="space-y-3">
              <h4 className="text-md font-medium">{group.title}</h4>
              <div className="space-y-3 pl-4 border-l-2 border-muted-foreground/20">
                {groupQuestions
                  .sort((a, b) => a.order - b.order)
                  .map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onUpdate={handleUpdateQuestion}
                      onDelete={handleDeleteQuestion}
                      enableAllMedia={enableAllMedia}
                    />
                  ))}
                <button
                  type="button"
                  className="px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
                  onClick={() => handleAddQuestion(group.id)}
                >
                  Adicionar Pergunta ao Grupo
                </button>
              </div>
            </div>
          );
        })
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={() => handleAddQuestion("default")}
        >
          Adicionar Pergunta
        </button>
      </div>
    </div>
  );
}
