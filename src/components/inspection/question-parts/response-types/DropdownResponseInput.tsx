import React from "react";

interface DropdownResponseInputProps {
  question: any;
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
}

export function DropdownResponseInput({
  question,
  value,
  onChange,
  readOnly = false
}: DropdownResponseInputProps) {
  const options = question.options || [];
  return (
    <select
      className="border rounded px-3 py-2 w-full"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      disabled={readOnly}
    >
      <option value="">Selecione...</option>
      {options.map((option: string, idx: number) => (
        <option key={idx} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
