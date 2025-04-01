
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { QuestionGroupsList } from "./QuestionGroupsList";
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
  // Usar "flat" por padrão, mesmo se não houver grupos
  useEffect(() => {
    if (groups.length === 0 && viewMode === "grouped") {
      onViewModeChange("flat");
    }
  }, [groups.length, viewMode, onViewModeChange]);

  // Obter todas as perguntas, incluindo as de sub-checklists
  const getAllQuestionsWithSubchecklists = () => {
    // Criar um mapa para armazenar quais perguntas têm sub-checklists
    const questionsWithSubs = new Map<string, ChecklistQuestion[]>();
    
    // Identificar perguntas de sub-checklists e organizá-las por pergunta pai
    questions.forEach(q => {
      if (q.parentQuestionId) {
        const parentQs = questionsWithSubs.get(q.parentQuestionId) || [];
        parentQs.push(q);
        questionsWithSubs.set(q.parentQuestionId, parentQs);
      }
    });
    
    // Criar lista ordenada com todas as perguntas incluindo sub-perguntas
    const orderedQuestions: ChecklistQuestion[] = [];
    let counter = 1;
    
    // Função recursiva para adicionar perguntas e suas sub-perguntas
    const addQuestionsRecursively = (qs: ChecklistQuestion[], parentNumber: string = '') => {
      // Ordenar as perguntas por ordem
      const sortedQs = [...qs].sort((a, b) => a.order - b.order);
      
      sortedQs.forEach((q, index) => {
        // Definir numeração adequada
        const questionNumber = parentNumber ? `${parentNumber}.${index + 1}` : `${counter}`;
        
        // Adicionar a pergunta principal com seu número
        const questionWithNumber = { ...q, displayNumber: questionNumber };
        orderedQuestions.push(questionWithNumber);
        
        // Se não for parentNumber (ou seja, não é uma sub-pergunta), incrementar contador principal
        if (!parentNumber) {
          counter++;
        }
        
        // Verificar e adicionar sub-perguntas, se houver
        const subQuestions = questionsWithSubs.get(q.id);
        if (subQuestions && subQuestions.length > 0) {
          addQuestionsRecursively(subQuestions, questionNumber);
        }
      });
    };
    
    // Começar com perguntas que não são sub-perguntas
    const rootQuestions = questions.filter(q => !q.parentQuestionId);
    addQuestionsRecursively(rootQuestions);
    
    return orderedQuestions;
  };

  // Obter todas as perguntas com numeração hierárquica
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
        {/* Lista plana de perguntas */}
        {viewMode === "flat" && (
          <FlatQuestionsList
            questions={allQuestionsWithHierarchy}
            onAddQuestion={() => onAddQuestion(groups[0]?.id || "default")}
            onUpdateQuestion={onUpdateQuestion}
            onDeleteQuestion={onDeleteQuestion}
            enableAllMedia={enableAllMedia}
          />
        )}
        
        {/* Perguntas agrupadas */}
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
