
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface QuestionCountSelectorProps {
  questionCount: number;
  setQuestionCount: React.Dispatch<React.SetStateAction<number>>;
}

export function QuestionCountSelector({ 
  questionCount, 
  setQuestionCount 
}: QuestionCountSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="question-count" className="flex items-center justify-between">
        <span>Quantidade de Perguntas</span>
        <span className="text-sm text-muted-foreground">{questionCount}</span>
      </Label>
      <div className="flex items-center gap-4">
        <Slider
          id="question-count"
          value={[questionCount]}
          min={1}
          max={50}
          step={1}
          onValueChange={(values) => setQuestionCount(values[0])}
          className="flex-1"
        />
        <Input
          type="number"
          min={1}
          max={50}
          value={questionCount}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 1 && value <= 50) {
              setQuestionCount(value);
            }
          }}
          className="w-16"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Defina quantas perguntas o assistente deve gerar (de 1 a 50)
      </p>
    </div>
  );
}

export default QuestionCountSelector;
