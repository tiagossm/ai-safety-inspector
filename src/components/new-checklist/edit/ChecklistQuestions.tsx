import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { QuestionGroupsList } from "@/components/new-checklist/question-editor/QuestionGroupsList";
import { FlatQuestionsList } from "./FlatQuestionsList";

interface ChecklistQuestionsProps {
  questions: ChecklistQuestion[];
  groups: ChecklistGroup[];
  nonEmptyGroups: ChecklistGroup[];
  questionsByGroup: Map<string, ChecklistQuestion[]>;
  viewMode: "flat" | "grouped";
  onViewModeChange: (mode: "flat" | "grouped") => void;
  onAddGroup: () => void;
  onUpdateGroup: (group: ChecklistGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddQuestion: (groupId: string) => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDragEnd: (result: any) => void;
  enableAllMedia?: boolean;
  isSubmitting?: boolean;
}

export function ChecklistQuestions({
  questions,
  groups,
  nonEmptyGroups,
  questionsByGroup,
  viewMode,
  onViewModeChange,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDragEnd,
  enableAllMedia = false,
  isSubmitting = false
}: ChecklistQuestionsProps) {
  useEffect(() => {
    if (groups.length === 0 && viewMode === "grouped") {
      onViewModeChange("flat");
    }
  }, [groups.length, viewMode, onViewModeChange]);

  const getAllQuestionsWithSubchecklists = () => {
    const questionsWithSubs = new Map<string, ChecklistQuestion[]>();
    
    questions.forEach(q => {
      if (q.parentQuestionId) {
        const parentQs = questionsWithSubs.get(q.parentQuestionId) || [];
        parentQs.push(q);
        questionsWithSubs.set(q.parentQuestionId, parentQs);
      }
    });
    
    const orderedQuestions: ChecklistQuestion[] = [];
    let counter = 1;
    
    const addQuestionsRecursively = (qs: ChecklistQuestion[], parentNumber: string = '') => {
      const sortedQs = [...qs].sort((a, b) => a.order - b.order);
      
      sortedQs.forEach((q, index) => {
        const questionNumber = parentNumber ? `${parentNumber}.${index + 1}` : `${counter}`;
        
        const questionWithNumber = { ...q, displayNumber: questionNumber };
        orderedQuestions.push(questionWithNumber);
        
        if (!parentNumber) {
          counter++;
        }
        
        const subQuestions = questionsWithSubs.get(q.id);
        if (subQuestions && subQuestions.length > 0) {
          addQuestionsRecursively(subQuestions, questionNumber);
        }
      });
    };
    
    const rootQuestions = questions.filter(q => !q.parentQuestionId);
    addQuestionsRecursively(rootQuestions);
    
    return orderedQuestions;
  };

  const allQuestionsWithHierarchy = getAllQuestionsWithSubchecklists();

  return (
    <Card>
      <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
        <h2 className="text-xl font-semibold">Perguntas {questions.length > 0 ? `(${questions.length})` : ""}</h2>
        <Tabs 
          value={viewMode} 
          onValueChange={(value) => onViewModeChange(value as "flat" | "grouped")}
        >
          <TabsList>
            <TabsTrigger value="flat">Lista</TabsTrigger>
            <TabsTrigger value="grouped">Agrupado</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-6">
        {viewMode === "flat" && (
          <FlatQuestionsList
            questions={allQuestionsWithHierarchy}
            onUpdateQuestion={onUpdateQuestion}
            onDeleteQuestion={onDeleteQuestion}
            enableAllMedia={enableAllMedia}
            isSubmitting={isSubmitting}
          />
        )}
        
        {viewMode === "grouped" && (
          <div className="space-y-4">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="groups" type="GROUP">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {nonEmptyGroups.length > 0 ? (
                      <QuestionGroupsList
                        groups={nonEmptyGroups}
                        questionsByGroup={questionsByGroup}
                        onUpdateGroup={onUpdateGroup}
                        onAddQuestion={onAddQuestion}
                        onUpdateQuestion={onUpdateQuestion}
                        onDeleteQuestion={onDeleteQuestion}
                        onDeleteGroup={onDeleteGroup}
                        enableAllMedia={enableAllMedia}
                        isSubmitting={isSubmitting}
                      />
                    ) : (
                      <div className="text-center py-8 border border-dashed rounded">
                        <p className="text-muted-foreground mb-4">Nenhum grupo com perguntas encontrado</p>
                        <Button 
                          variant="outline" 
                          onClick={onAddGroup}
                          className="mx-auto"
                          disabled={isSubmitting}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Grupo
                        </Button>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {nonEmptyGroups.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={onAddGroup}
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Grupo
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
