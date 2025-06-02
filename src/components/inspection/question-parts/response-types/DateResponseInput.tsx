
import React from "react";
import { DateInput } from "@/components/inspection/question-inputs/DateInput";

interface DateResponseInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function DateResponseInput({ value, onChange, readOnly = false }: DateResponseInputProps) {
  return (
    <DateInput 
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
}
