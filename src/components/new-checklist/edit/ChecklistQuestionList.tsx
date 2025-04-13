
import React, { useMemo } from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { FlatQuestionsList } from "./FlatQuestionsList";
import { ChecklistGroupEditor } from "./ChecklistGroupEditor";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChecklistToolbar } from "./ChecklistToolbar";
import { ChecklistQuestion } from "@/types/newChecklist";

export function ChecklistQuestionList() {
  const { 
    questions, 
    groups, 
    viewMode, 
    handleAddQuestion, 
    handleUpdateQuestion, 
    handleDeleteQuestion,
    enableAllMedia,
    isSubmitting
  } = useChecklistEditor();

  // Get all questions with proper hierarchy and numbering
  const allQuestionsWithHierarchy = useMemo(() => {
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
  }, [questions]);

  return (
    <Card>
      <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
        <h2 className="text-xl font-semibold">Perguntas {questions.length > 0 ? `(${questions.length})` : ""}</h2>
        <ChecklistToolbar />
      </CardHeader>
      <CardContent className="pt-6">
        {viewMode === "flat" && (
          <FlatQuestionsList
            questions={allQuestionsWithHierarchy}
            onAddQuestion={() => handleAddQuestion(groups[0]?.id || "default")}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            enableAllMedia={enableAllMedia}
            isSubmitting={isSubmitting}
          />
        )}
        
        {viewMode === "grouped" && (
          <ChecklistGroupEditor />
        )}
      </CardContent>
    </Card>
  );
}
