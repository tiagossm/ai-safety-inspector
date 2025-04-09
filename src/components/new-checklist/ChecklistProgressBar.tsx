
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ChecklistProgressBarProps {
  totalQuestions: number;
  completedQuestions: number;
}

export function ChecklistProgressBar({
  totalQuestions,
  completedQuestions
}: ChecklistProgressBarProps) {
  const progressPercentage = totalQuestions > 0
    ? Math.round((completedQuestions / totalQuestions) * 100)
    : 0;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Progresso</span>
        <span>
          {completedQuestions}/{totalQuestions} ({progressPercentage}%)
        </span>
      </div>
      <Progress value={progressPercentage} className="h-1" />
    </div>
  );
}
