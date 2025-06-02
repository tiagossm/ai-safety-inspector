
import React from "react";
import { TimeInput } from "@/components/inspection/question-inputs/TimeInput";

interface TimeResponseInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function TimeResponseInput({ value, onChange, readOnly = false }: TimeResponseInputProps) {
  return (
    <TimeInput 
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
}
