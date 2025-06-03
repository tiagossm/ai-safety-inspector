
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Textarea } from "@/components/ui/textarea";

interface HintSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function HintSection({ question, onUpdate }: HintSectionProps) {
  const parseHint = (hint?: string | null): string => {
    if (!hint) return "";

    try {
      if (typeof hint === 'string' && hint.startsWith("{") && hint.endsWith("}")) {
        const parsed = JSON.parse(hint);
        if (parsed.groupId && parsed.groupTitle) {
          return "";
        }
      }
    } catch (e) {}
    return hint;
  };

  const userHint = parseHint(question.hint);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Dica para o inspetor
      </label>
      <Textarea
        placeholder="Digite uma dica que será exibida para ajudar o inspetor..."
        value={userHint}
        onChange={(e) => onUpdate({ ...question, hint: e.target.value })}
        className="w-full"
        rows={2}
      />
    </div>
  );
}
