
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
  isSubmitting?: boolean;
}

export function QuestionGroupsList({
  groups,
  questionsByGroup,
  onUpdateGroup,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDeleteGroup,
  enableAllMedia = false,
  isSubmitting = false
}: QuestionGroupsListProps) {
  // Handle adding sub-questions
  const handleAddSubQuestion = (parentId: string) => {
    // Find the parent question to get its group
    const allQuestions = Array.from(questionsByGroup.values()).flat();
    const parentQuestion = allQuestions.find(q => q.id === parentId);
    
    if (parentQuestion) {
      const newId = `new-${Date.now()}`;
      const siblingSubQuestions = allQuestions.filter(q => q.parentQuestionId === parentId);
      const order = allQuestions.length + siblingSubQuestions.length;

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
      
      onUpdateQuestion(newSubQuestion);
    }
  };

  return (
    <>
      {groups.map((group, index) => {
        const groupQuestions = questionsByGroup.get(group.id) || [];
        
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
                        groupIndex={index}
                        onUpdateGroup={onUpdateGroup}
                        onAddQuestion={onAddQuestion}
                        onUpdateQuestion={onUpdateQuestion}
                        onDeleteQuestion={onDeleteQuestion}
                        onDeleteGroup={onDeleteGroup}
                        onAddSubQuestion={handleAddSubQuestion}
                        dragHandleProps={draggableProvided.dragHandleProps}
                        enableAllMedia={enableAllMedia}
                        isSubmitting={isSubmitting}
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
