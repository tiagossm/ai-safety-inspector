
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GripVertical, Settings, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Trash2 } from "lucide-react";

interface QuestionEditorHeaderProps {
  question: ChecklistQuestion;
  questionIndex: number;
  isValid: boolean;
  hasText: boolean;
  showAdvanced: boolean;
  isDragging: boolean;
  onUpdate: (field: keyof ChecklistQuestion, value: any) => void;
  onDelete: (questionId: string) => void;
  onToggleAdvanced: (show: boolean) => void;
}

export function QuestionEditorHeader({
  question,
  questionIndex,
  isValid,
  hasText,
  showAdvanced,
  isDragging,
  onUpdate,
  onDelete,
  onToggleAdvanced
}: QuestionEditorHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="cursor-move text-gray-400 hover:text-gray-600">
        <GripVertical className="h-5 w-5" />
      </div>
      
      <Badge variant="outline" className="min-w-[2.5rem] text-center">
        {questionIndex + 1}
      </Badge>
      
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1">
          <Textarea
            placeholder="Digite o texto da pergunta..."
            value={question.text || ""}
            onChange={(e) => onUpdate("text", e.target.value)}
            className={`border-0 p-0 resize-none min-h-[2rem] text-base font-medium ${
              !hasText ? 'text-amber-600 placeholder-amber-400' : ''
            }`}
            rows={1}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600" />
          )}
          
          <Collapsible open={showAdvanced} onOpenChange={onToggleAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(question.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
