
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface QuestionCounterProps {
  totalQuestions: number;
  totalGroups: number;
}

export function QuestionCounter({ totalQuestions, totalGroups }: QuestionCounterProps) {
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-gray-500" />
      <Badge variant="secondary" className="flex items-center gap-1">
        <span>{totalQuestions}</span>
        <span className="text-xs">pergunta{totalQuestions !== 1 ? 's' : ''}</span>
      </Badge>
      {totalGroups > 1 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <span>{totalGroups}</span>
          <span className="text-xs">grupo{totalGroups !== 1 ? 's' : ''}</span>
        </Badge>
      )}
    </div>
  );
}
