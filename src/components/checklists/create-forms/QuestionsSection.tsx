
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FormSection } from "./FormSection";
import { QuestionItem } from "./QuestionItem";

interface QuestionsSectionProps {
  questions: Array<{
    text: string;
    type: string;
    required: boolean;
    allowPhoto: boolean;
    allowVideo: boolean;
    allowAudio: boolean;
    options?: string[];
    hint?: string;
    weight?: number;
    parentId?: string;
    conditionValue?: string;
  }>;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onQuestionChange: (index: number, field: string, value: string | boolean) => void;
}

export function QuestionsSection({ 
  questions, 
  onAddQuestion, 
  onRemoveQuestion, 
  onQuestionChange 
}: QuestionsSectionProps) {
  return (
    <FormSection title="Perguntas">
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionItem
            key={index}
            index={index}
            question={question}
            onRemove={onRemoveQuestion}
            onChange={onQuestionChange}
          />
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={onAddQuestion}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Pergunta
        </Button>
      </div>
    </FormSection>
  );
}
