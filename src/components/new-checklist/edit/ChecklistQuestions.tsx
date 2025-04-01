
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
  enableAllMedia = false
}: ChecklistQuestionsProps) {
  // Use "flat" by default, especially if there are no groups
  useEffect(() => {
    if (groups.length === 0 && viewMode === "grouped") {
      onViewModeChange("flat");
    }
  }, [groups.length, viewMode, onViewModeChange]);

  // Get all questions, including sub-checklist questions
  const getAllQuestionsWithSubchecklists = () => {
    // Create a map to store which questions have sub-checklists
    const questionsWithSubs = new Map<string, ChecklistQuestion[]>();
    
    // Identify sub-checklist questions and organize them by parent question
    questions.forEach(q => {
      if (q.parentQuestionId) {
        const parentQs = questionsWithSubs.get(q.parentQuestionId) || [];
        parentQs.push(q);
        questionsWithSubs.set(q.parentQuestionId, parentQs);
      }
    });
    
    // Create ordered list with all questions including sub-questions
    const orderedQuestions: ChecklistQuestion[] = [];
    let counter = 1;
    
    // Recursive function to add questions and their sub-questions
    const addQuestionsRecursively = (qs: ChecklistQuestion[], parentNumber: string = '') => {
      // Sort questions by order
      const sortedQs = [...qs].sort((a, b) => a.order - b.order);
      
      sortedQs.forEach((q, index) => {
        // Define appropriate numbering
        const questionNumber = parentNumber ? `${parentNumber}.${index + 1}` : `${counter}`;
        
        // Add the main question with its number
        const questionWithNumber = { ...q, displayNumber: questionNumber };
        orderedQuestions.push(questionWithNumber);
        
        // If not parentNumber (i.e., not a sub-question), increment main counter
        if (!parentNumber) {
          counter++;
        }
        
        // Check and add sub-questions if any
        const subQuestions = questionsWithSubs.get(q.id);
        if (subQuestions && subQuestions.length > 0) {
          addQuestionsRecursively(subQuestions, questionNumber);
        }
      });
    };
    
    // Start with questions that are not sub-questions
    const rootQuestions = questions.filter(q => !q.parentQuestionId);
    addQuestionsRecursively(rootQuestions);
    
    return orderedQuestions;
  };

  // Get all questions with hierarchical numbering
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
        {/* Flat questions list */}
        {viewMode === "flat" && (
          <FlatQuestionsList
            questions={allQuestionsWithHierarchy}
            onAddQuestion={() => onAddQuestion(groups[0]?.id || "default")}
            onUpdateQuestion={onUpdateQuestion}
            onDeleteQuestion={onDeleteQuestion}
            enableAllMedia={enableAllMedia}
          />
        )}
        
        {/* Grouped questions */}
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
                      />
                    ) : (
                      <div className="text-center py-8 border border-dashed rounded">
                        <p className="text-muted-foreground mb-4">Nenhum grupo com perguntas encontrado</p>
                        <Button 
                          variant="outline" 
                          onClick={onAddGroup}
                          className="mx-auto"
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
