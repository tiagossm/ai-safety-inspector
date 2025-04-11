
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChecklistItem } from "@/components/new-checklist/ChecklistItem";

interface ChecklistQuestionsProps {
  questions: any[];
  isEmpty: boolean;
}

export function ChecklistQuestions({ questions, isEmpty }: ChecklistQuestionsProps) {
  if (isEmpty) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Este checklist não possui questões.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <ChecklistItem 
          key={question.id}
          title={question.text}
          type={question.responseType}
          required={question.isRequired}
          order={index + 1}
          hasSubchecklist={question.hasSubChecklist}
          options={question.options}
        />
      ))}
    </div>
  );
}
