
import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChecklistQuestion } from "@/types/newChecklist";
import { GripVertical } from "lucide-react";

interface QuestionHeaderProps {
  question: ChecklistQuestion;
  questionNumber: string;
  depth: number;
  onUpdate: (question: ChecklistQuestion) => void;
  isSubQuestion?: boolean;
  dragHandleProps?: any;
}

export function QuestionHeader({
  question,
  questionNumber,
  depth,
  onUpdate,
  isSubQuestion = false,
  dragHandleProps
}: QuestionHeaderProps) {
  const handleTextChange = (text: string) => {
    onUpdate({ ...question, text });
  };

  const getDepthColor = (depth: number) => {
    switch (depth) {
      case 0: return "bg-blue-100 text-blue-800";
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`p-3 border-b ${isSubQuestion ? 'bg-gray-100' : 'bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {dragHandleProps && (
          <div {...dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        {/* Question Number Badge */}
        <Badge variant="outline" className={`mt-1 ${getDepthColor(depth)} shrink-0`}>
          {questionNumber}
        </Badge>
        
        {/* Question Text Input */}
        <div className="flex-1 min-w-0">
          <Input
            value={question.text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={`Digite a ${isSubQuestion ? 'subpergunta' : 'pergunta'}...`}
            className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          
          {/* Question Metadata */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              Tipo: {question.responseType}
            </span>
            {question.isRequired && (
              <Badge variant="secondary" className="text-xs">
                Obrigatório
              </Badge>
            )}
            {question.weight > 1 && (
              <Badge variant="outline" className="text-xs">
                Peso: {question.weight}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
