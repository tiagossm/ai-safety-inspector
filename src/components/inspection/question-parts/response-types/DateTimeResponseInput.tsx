
import React from "react";
import { DateTimeInput } from "@/components/inspection/question-inputs/DateTimeInput";

interface DateTimeResponseInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function DateTimeResponseInput({ 
  value, 
  onChange, 
  readOnly = false 
}: DateTimeResponseInputProps) {
  return (
    <DateTimeInput 
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
}
