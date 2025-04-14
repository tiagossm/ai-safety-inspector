
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, List } from "lucide-react";

interface QuestionHeaderProps {
  questionText: string;
  numberLabel: string | number;
  index: number;
  hasSubChecklist: boolean;
  onOpenSubChecklist?: () => void;
}

export function QuestionHeader({ 
  questionText, 
  numberLabel, 
  index, 
  hasSubChecklist, 
  onOpenSubChecklist 
}: QuestionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-base font-medium flex-1">{questionText}</div>
      
      {hasSubChecklist && onOpenSubChecklist && (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSubChecklist}
          className="flex items-center"
        >
          <List className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Ver sub-checklist</span>
        </Button>
      )}
    </div>
  );
}
