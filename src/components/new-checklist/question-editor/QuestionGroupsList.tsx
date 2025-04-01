
import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { QuestionGroup } from "@/components/new-checklist/question-editor/QuestionGroup";

interface QuestionGroupsListProps {
  groups: ChecklistGroup[];
  questionsByGroup: Map<string, ChecklistQuestion[]>;
  onUpdateGroup: (group: ChecklistGroup) => void;
  onAddQuestion: (groupId: string) => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  enableAllMedia?: boolean;
}

export function QuestionGroupsList({
  groups,
  questionsByGroup,
  onUpdateGroup,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDeleteGroup,
  enableAllMedia = false
}: QuestionGroupsListProps) {
  return (
    <>
      {groups.map((group, index) => {
        const groupQuestions = questionsByGroup.get(group.id) || [];
        
        // Only render groups that have at least one question
        if (groupQuestions.length === 0) {
          return null;
        }
        
        return (
          <Draggable 
            key={group.id} 
            draggableId={group.id} 
            index={index}
          >
            {(draggableProvided) => (
              <div
                ref={draggableProvided.innerRef}
                {...draggableProvided.draggableProps}
              >
                <Droppable 
                  droppableId={group.id} 
                  type="QUESTION"
                >
                  {(droppableProvided) => (
                    <div
                      ref={droppableProvided.innerRef}
                      {...droppableProvided.droppableProps}
                    >
                      <QuestionGroup
                        group={group}
                        questions={groupQuestions}
                        onUpdateGroup={onUpdateGroup}
                        onAddQuestion={onAddQuestion}
                        onUpdateQuestion={onUpdateQuestion}
                        onDeleteQuestion={onDeleteQuestion}
                        onDeleteGroup={onDeleteGroup}
                        dragHandleProps={draggableProvided.dragHandleProps}
                        enableAllMedia={enableAllMedia}
                      />
                      {droppableProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}
          </Draggable>
        );
      })}
    </>
  );
}
