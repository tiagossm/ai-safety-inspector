
import React from "react";

interface QuestionFooterProps {
  question: any;
}

export function QuestionFooter({ question }: QuestionFooterProps) {
  // If the question has a hint, display it
  if (!question.hint) return null;
  
  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-xs text-gray-500">{question.hint}</p>
    </div>
  );
}
