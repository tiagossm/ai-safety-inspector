
import React from "react";
import { ParagraphInput } from "@/components/inspection/question-inputs/ParagraphInput";

interface ParagraphResponseInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
  maxLength?: number;
}

export function ParagraphResponseInput({ 
  value, 
  onChange, 
  readOnly = false,
  maxLength = 1000
}: ParagraphResponseInputProps) {
  return (
    <ParagraphInput 
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      maxLength={maxLength}
      placeholder="Digite sua resposta detalhada..."
      minRows={4}
    />
  );
}
