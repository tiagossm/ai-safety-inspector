
import React from "react";
import { Button } from "@/components/ui/button";

interface MultipleChoiceInputProps {
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export function MultipleChoiceInput({ options, value, onChange }: MultipleChoiceInputProps) {
  if (!options || options.length === 0) {
    return <p className="text-xs text-muted-foreground mt-2">Nenhuma opção disponível</p>;
  }
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((option: string, i: number) => (
        <Button
          key={i}
          variant={value === option ? "default" : "outline"}
          onClick={() => onChange(option)}
          size="sm"
          className="text-xs h-8"
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
