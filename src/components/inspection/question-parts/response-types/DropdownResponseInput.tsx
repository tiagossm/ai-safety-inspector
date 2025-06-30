
import React from "react";
import { DropdownInput } from "@/components/inspection/question-inputs/DropdownInput";

interface DropdownResponseInputProps {
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function DropdownResponseInput({ 
  options, 
  value, 
  onChange, 
  readOnly = false 
}: DropdownResponseInputProps) {
  return (
    <DropdownInput 
      options={options}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
}
