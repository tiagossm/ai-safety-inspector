
import React from "react";
import { CheckboxesInput } from "@/components/inspection/question-inputs/CheckboxesInput";

interface CheckboxesResponseInputProps {
  options: string[];
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  readOnly?: boolean;
}

export function CheckboxesResponseInput({ 
  options, 
  value, 
  onChange, 
  readOnly = false 
}: CheckboxesResponseInputProps) {
  return (
    <CheckboxesInput 
      options={options}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
}
