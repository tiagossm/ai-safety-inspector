
import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { ChecklistGroup, ChecklistQuestion } from "@/types/newChecklist";
import { QuestionItem } from "./QuestionItem";

interface QuestionGroupsListProps {
  groups: ChecklistGroup[];
  questionsByGroup: Map<string, ChecklistQuestion[]>;
  onUpdateGroup: (group: ChecklistGroup) => void;
  onAddQuestion: (groupId: string) => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditSubChecklist?: (questionId: string, subChecklistId: string) => void;
}

export function QuestionGroupsList({
  groups,
  questionsByGroup,
  onUpdateGroup,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDeleteGroup,
  onEditSubChecklist
}: QuestionGroupsListProps) {
  return (
    <>
      {groups.map((group, index) => (
        <Draggable key={group.id} draggableId={group.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className="mb-6"
            >
              <Card className="border shadow-sm">
                <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between gap-4 border-b">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      {...provided.dragHandleProps}
                      className="cursor-grab p-1 hover:bg-accent rounded"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      value={group.title}
                      onChange={(e) => onUpdateGroup({ ...group, title: e.target.value })}
                      className="h-8 text-base font-medium"
                      placeholder="Título do grupo"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteGroup(group.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-3">
                  <Droppable droppableId={group.id} type="QUESTION">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-3"
                      >
                        {(questionsByGroup.get(group.id) || []).map((question, qIndex) => (
                          <QuestionItem
                            key={question.id}
                            question={question}
                            index={qIndex}
                            onUpdateQuestion={onUpdateQuestion}
                            onDeleteQuestion={onDeleteQuestion}
                            onEditSubChecklist={onEditSubChecklist}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddQuestion(group.id)}
                    className="mt-4 w-full border border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Pergunta
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
}
