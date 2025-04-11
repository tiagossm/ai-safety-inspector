
import React from "react";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/utils/format";

interface ChecklistProgressBarProps {
  totalQuestions: number;
  completedQuestions: number;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
  progressBarClassName?: string;
}

/**
 * Component for rendering checklist completion progress
 */
export const ChecklistProgressBar: React.FC<ChecklistProgressBarProps> = ({ 
  totalQuestions, 
  completedQuestions,
  showPercentage = false,
  showLabel = true,
  label = "Progresso",
  className = "mt-3 space-y-1", 
  progressBarClassName = "h-1"
}) => {
  const progress = totalQuestions > 0 
    ? Math.round((completedQuestions / totalQuestions) * 100) 
    : 0;

  if (totalQuestions === 0) return null;

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>
            {completedQuestions || 0} de {totalQuestions} itens
            {showPercentage && ` (${formatPercent(progress)})`}
          </span>
        </div>
      )}
      <Progress value={progress} className={progressBarClassName} />
    </div>
  );
};
