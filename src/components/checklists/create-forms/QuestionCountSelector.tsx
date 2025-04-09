
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface QuestionCountSelectorProps {
  questionCount: number;
  setQuestionCount: (count: number) => void;
}

const QuestionCountSelector: React.FC<QuestionCountSelectorProps> = ({ 
  questionCount, 
  setQuestionCount 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="question-count">Número de Perguntas</Label>
        <span className="text-sm font-medium">{questionCount}</span>
      </div>
      <Slider
        id="question-count"
        defaultValue={[questionCount]}
        min={5}
        max={50}
        step={5}
        onValueChange={(value) => setQuestionCount(value[0])}
        className="py-2"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>5</span>
        <span>50</span>
      </div>
    </div>
  );
};

export default QuestionCountSelector;
