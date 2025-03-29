
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { QuestionGroupsList } from "./QuestionGroupsList";

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
  onDragEnd
}: ChecklistQuestionsProps) {
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
