
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuestionGroup } from "./QuestionGroup";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface QuestionType {
  text: string;
  type: string;
  required: boolean;
  allowPhoto: boolean;
  allowVideo: boolean;
  allowAudio: boolean;
  options?: string[];
  hint?: string;
  weight?: number;
  parentId?: string;
  conditionValue?: string;
  groupId?: string;
}

interface GroupType {
  id: string;
  title: string;
  questions: QuestionType[];
}

interface GroupedQuestionsSectionProps {
  groups: GroupType[];
  onGroupsChange: (groups: GroupType[]) => void;
}

export function GroupedQuestionsSection({ 
  groups, 
  onGroupsChange
}: GroupedQuestionsSectionProps) {
  const handleAddGroup = () => {
    onGroupsChange([
      ...groups,
      {
        id: `group-${Date.now()}`,
        title: `Novo Grupo`,
        questions: []
      }
    ]);
  };

  const handleRemoveGroup = (groupId: string) => {
    onGroupsChange(groups.filter(group => group.id !== groupId));
  };

  const handleGroupTitleChange = (groupId: string, title: string) => {
    onGroupsChange(
      groups.map(group => 
        group.id === groupId 
          ? { ...group, title } 
          : group
      )
    );
  };

  const handleAddQuestion = (groupId: string) => {
    onGroupsChange(
      groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            questions: [
              ...group.questions,
              {
                text: "",
                type: "sim/não",
                required: true,
                allowPhoto: false,
                allowVideo: false,
                allowAudio: false,
                groupId
              }
            ]
          };
        }
        return group;
      })
    );
  };

  const handleRemoveQuestion = (groupId: string, questionIndex: number) => {
    onGroupsChange(
      groups.map(group => {
        if (group.id === groupId) {
          const newQuestions = [...group.questions];
          newQuestions.splice(questionIndex, 1);
          return {
            ...group,
            questions: newQuestions
          };
        }
        return group;
      })
    );
  };

  const handleQuestionChange = (
    groupId: string,
    questionIndex: number,
    field: string,
    value: any
  ) => {
    onGroupsChange(
      groups.map(group => {
        if (group.id === groupId) {
          const newQuestions = [...group.questions];
          newQuestions[questionIndex] = {
            ...newQuestions[questionIndex],
            [field]: value
          };
          return {
            ...group,
            questions: newQuestions
          };
        }
        return group;
      })
    );
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, type } = result;

    // If there's no destination or the item was dropped in its original position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Handle group reordering
    if (type === 'GROUP') {
      const newGroups = Array.from(groups);
      const [movedGroup] = newGroups.splice(source.index, 1);
      newGroups.splice(destination.index, 0, movedGroup);
      onGroupsChange(newGroups);
      return;
    }

    // Handle question reordering within the same group
    if (destination.droppableId === source.droppableId) {
      const groupId = source.droppableId;
      const targetGroup = groups.find(g => g.id === groupId);
      
      if (targetGroup) {
        const newQuestions = Array.from(targetGroup.questions);
        const [movedQuestion] = newQuestions.splice(source.index, 1);
        newQuestions.splice(destination.index, 0, movedQuestion);
        
        onGroupsChange(
          groups.map(group => 
            group.id === groupId 
              ? { ...group, questions: newQuestions } 
              : group
          )
        );
      }
    } 
    // Handle question moving between groups
    else {
      const sourceGroupId = source.droppableId;
      const destGroupId = destination.droppableId;
      
      const sourceGroup = groups.find(g => g.id === sourceGroupId);
      const destGroup = groups.find(g => g.id === destGroupId);
      
      if (sourceGroup && destGroup) {
        const sourceQuestions = Array.from(sourceGroup.questions);
        const [movedQuestion] = sourceQuestions.splice(source.index, 1);
        
        // Update the groupId of the moved question
        const updatedQuestion = {
          ...movedQuestion,
          groupId: destGroupId
        };
        
        const destQuestions = Array.from(destGroup.questions);
        destQuestions.splice(destination.index, 0, updatedQuestion);
        
        onGroupsChange(
          groups.map(group => {
            if (group.id === sourceGroupId) {
              return { ...group, questions: sourceQuestions };
            }
            if (group.id === destGroupId) {
              return { ...group, questions: destQuestions };
            }
            return group;
          })
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Categorias de Perguntas</h2>
        <Button 
          onClick={handleAddGroup}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="groups" type="GROUP">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {groups.map((group, index) => (
                <Draggable 
                  key={group.id} 
                  draggableId={group.id} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Droppable 
                        droppableId={group.id} 
                        type="QUESTION"
                      >
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps}>
                            <QuestionGroup
                              id={group.id}
                              title={group.title}
                              questions={group.questions}
                              onTitleChange={handleGroupTitleChange}
                              onAddQuestion={handleAddQuestion}
                              onRemoveQuestion={handleRemoveQuestion}
                              onQuestionChange={handleQuestionChange}
                              onRemoveGroup={handleRemoveGroup}
                              isDragging={snapshot.isDragging}
                              dragHandleProps={provided.dragHandleProps}
                            />
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {groups.length === 0 && (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-2">Nenhum grupo criado</p>
          <Button onClick={handleAddGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Grupo
          </Button>
        </div>
      )}
    </div>
  );
}
