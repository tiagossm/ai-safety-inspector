
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
  // Calculate progress percentage
  const progress = totalQuestions > 0 
    ? Math.round((completedQuestions / totalQuestions) * 100) 
    : 0;
  
  // Return early if there are no questions
  if (totalQuestions === 0) return null;

  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progresso</span>
        <span aria-live="polite">
          {completedQuestions || 0} de {totalQuestions} itens
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-1" 
        aria-label={`${progress}% completo`}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};
