
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical } from "lucide-react";

interface QuestionHeaderProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  isSubQuestion?: boolean;
}

export function QuestionHeader({ question, onUpdate, isSubQuestion }: QuestionHeaderProps) {
  return (
    <div className={`p-4 border-b ${isSubQuestion ? 'bg-gray-100' : 'bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        <div className="mt-2">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex-1">
          <Textarea
            placeholder="Digite sua pergunta aqui..."
            value={question.text}
            onChange={(e) => onUpdate({ ...question, text: e.target.value })}
            className="w-full border-0 p-0 resize-none focus:ring-0 focus:outline-none bg-transparent text-base font-medium placeholder:text-gray-400"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>
      </div>
    </div>
  );
}
