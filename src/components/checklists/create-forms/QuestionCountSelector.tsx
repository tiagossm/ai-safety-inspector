
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from "@/components/ui/slider";

interface QuestionCountSelectorProps {
  questionCount: number;
  setQuestionCount: (count: number) => void;
  min?: number;
  max?: number;
}

export function QuestionCountSelector({
  questionCount,
  setQuestionCount,
  min = 3,
  max = 30
}: QuestionCountSelectorProps) {
  const handleSliderChange = (values: number[]) => {
    setQuestionCount(values[0]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      if (value < min) {
        setQuestionCount(min);
      } else if (value > max) {
        setQuestionCount(max);
      } else {
        setQuestionCount(value);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="questionCount">Quantidade de perguntas</Label>
        <Input
          id="questionCount"
          type="number"
          min={min}
          max={max}
          value={questionCount}
          onChange={handleInputChange}
          className="w-20 text-right"
        />
      </div>

      <Slider
        value={[questionCount]}
        min={min}
        max={max}
        step={1}
        onValueChange={handleSliderChange}
        className="pt-2 pb-4"
      >
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Min: {min}</span>
        <span>Recomendado: 15</span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
}

export default QuestionCountSelector;
