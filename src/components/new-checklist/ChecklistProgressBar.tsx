
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ChecklistProgressBarProps {
  totalQuestions: number;
  completedQuestions: number;
}

/**
 * Component for rendering checklist completion progress
 */
export const ChecklistProgressBar: React.FC<ChecklistProgressBarProps> = ({ 
  totalQuestions, 
  completedQuestions 
}) => {
  const progress = totalQuestions > 0 
    ? Math.round((completedQuestions / totalQuestions) * 100) 
    : 0;

  if (totalQuestions === 0) return null;

  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progresso</span>
        <span>{completedQuestions || 0} de {totalQuestions} itens</span>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  );
};
