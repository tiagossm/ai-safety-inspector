
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface QuestionHeaderProps {
  questionText: string;
  numberLabel: string | number;
  index: number;
  hasSubChecklist?: boolean;
  onOpenSubChecklist?: () => void;
}

export function QuestionHeader({
  questionText,
  numberLabel,
  index,
  hasSubChecklist = false,
  onOpenSubChecklist
}: QuestionHeaderProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="text-base font-medium">
          {questionText}
          {hasSubChecklist && onOpenSubChecklist && (
            <Button
              variant="link"
              size="sm"
              onClick={onOpenSubChecklist}
              className="h-auto p-0 ml-1 text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Open Sub-Checklist</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
