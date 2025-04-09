
import React from 'react';
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
        <Label htmlFor="question-count">Número de perguntas</Label>
        <span className="text-sm font-medium">{questionCount}</span>
      </div>
      <Slider
        id="question-count"
        min={5}
        max={30}
        step={1}
        value={[questionCount]}
        onValueChange={(values) => setQuestionCount(values[0])}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>5</span>
        <span>30</span>
      </div>
    </div>
  );
};

export default QuestionCountSelector;
