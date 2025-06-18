
import React from "react";
import { Input } from "@/components/ui/input";

interface SimpleTextInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function SimpleTextInput({
  value,
  onChange,
  readOnly = false,
  placeholder = "Digite sua resposta..."
}: SimpleTextInputProps) {
  return (
    <Input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  );
}
