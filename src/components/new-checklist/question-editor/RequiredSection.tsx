
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface RequiredSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function RequiredSection({ question, onUpdate }: RequiredSectionProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Configurações
      </label>
      
      <div className="flex items-center justify-between">
        <Label htmlFor={`required-${question.id}`} className="text-sm">
          Pergunta obrigatória
        </Label>
        <Switch
          id={`required-${question.id}`}
          checked={question.isRequired}
          onCheckedChange={(checked) => onUpdate({ 
            ...question, 
            isRequired: checked 
          })}
        />
      </div>
      
      {question.isRequired && (
        <p className="text-xs text-gray-500">
          Esta pergunta deve ser respondida para continuar
        </p>
      )}
    </div>
  );
}
