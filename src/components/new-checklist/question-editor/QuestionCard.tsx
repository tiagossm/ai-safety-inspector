
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "./QuestionEditor";

interface QuestionCardProps {
  question: ChecklistQuestion;
  questions?: ChecklistQuestion[];
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (id: string) => void;
  enableAllMedia?: boolean;
}

export function QuestionCard({
  question,
  questions = [],
  onUpdate,
  onDelete,
  enableAllMedia = false
}: QuestionCardProps) {
  return (
    <QuestionEditor
      question={question}
      questions={questions}
      onUpdate={onUpdate}
      onDelete={onDelete}
      enableAllMedia={enableAllMedia}
    />
  );
}
