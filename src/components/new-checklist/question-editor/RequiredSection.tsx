
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface RequiredSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function RequiredSection({ question, onUpdate }: RequiredSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Obrigatório
        </label>
        <Switch
          checked={question.isRequired}
          onCheckedChange={(checked) => 
            onUpdate({ ...question, isRequired: checked })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Peso/Pontos
        </label>
        <Input
          type="number"
          min="0"
          max="100"
          value={question.weight || 1}
          onChange={(e) => 
            onUpdate({ ...question, weight: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>
    </div>
  );
}
