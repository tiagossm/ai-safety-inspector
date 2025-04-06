
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface QuestionCountSelectorProps {
  questionCount: number;
  setQuestionCount: React.Dispatch<React.SetStateAction<number>>;
  min?: number;
  max?: number;
}

export function QuestionCountSelector({
  questionCount,
  setQuestionCount,
  min = 5,
  max = 30
}: QuestionCountSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="question-count">Número de perguntas</Label>
        <span className="text-sm font-medium">{questionCount}</span>
      </div>
      <Slider
        id="question-count"
        min={min}
        max={max}
        step={1}
        value={[questionCount]}
        onValueChange={(values) => setQuestionCount(values[0])}
        className="my-4"
      />
      <p className="text-sm text-muted-foreground">
        Defina a quantidade aproximada de perguntas que o checklist deve conter.
      </p>
    </div>
  );
}

export default QuestionCountSelector;
