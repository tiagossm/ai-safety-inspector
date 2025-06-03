
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

interface HintSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function HintSection({ question, onUpdate }: HintSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Info className="h-4 w-4" />
        Dica/Instrução
      </label>
      <Textarea
        placeholder="Adicione uma dica ou instrução para esta pergunta (opcional)"
        value={question.hint || ""}
        onChange={(e) => onUpdate({ ...question, hint: e.target.value })}
        className="resize-none"
        rows={2}
      />
      <p className="text-xs text-gray-500">
        Esta dica será exibida durante a execução da inspeção
      </p>
    </div>
  );
}
