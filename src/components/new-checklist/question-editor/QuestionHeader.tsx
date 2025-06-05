
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";

interface QuestionHeaderProps {
  question: ChecklistQuestion;
  questionNumber: string;
  depth: number;
  onUpdate: (question: ChecklistQuestion) => void;
  isSubQuestion?: boolean;
  onToggleAdvanced?: () => void;
  showAdvanced?: boolean;
}

export function QuestionHeader({
  question,
  questionNumber,
  depth,
  onUpdate,
  isSubQuestion = false,
  onToggleAdvanced,
  showAdvanced = false
}: QuestionHeaderProps) {
  const handleTitleChange = (title: string) => {
    onUpdate({ ...question, text: title });
  };

  const getDepthColor = (depth: number) => {
    switch (depth) {
      case 0: return "bg-blue-100 text-blue-800";
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 ${
      isSubQuestion ? 'bg-gray-100' : 'bg-gray-50'
    } border-b`}>
      <div className="cursor-move">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      
      <Badge variant="outline" className={`text-xs font-mono ${getDepthColor(depth)}`}>
        {questionNumber}
      </Badge>
      
      {question.isConditional && (
        <Badge variant="secondary" className="text-xs">
          Condicional
        </Badge>
      )}
      
      {question.hasSubChecklist && (
        <Badge variant="secondary" className="text-xs">
          Sub-checklist
        </Badge>
      )}
      
      <Input
        value={question.text}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Digite o texto da pergunta..."
        className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 font-medium"
      />
      
      {onToggleAdvanced && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleAdvanced}
          className="h-8 w-8 p-0"
        >
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
