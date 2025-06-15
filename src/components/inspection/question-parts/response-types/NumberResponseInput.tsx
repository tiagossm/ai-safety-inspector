
import React from "react";
import { Input } from "@/components/ui/input";

interface NumberResponseInputProps {
  question: any;
  value?: number | string;
  response?: any;
  onChange: (value: number | string) => void;
  readOnly?: boolean;
}

export function NumberResponseInput({
  question,
  value,
  response = {},
  onChange,
  readOnly = false
}: NumberResponseInputProps) {
  return (
    <Input
      type="number"
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      readOnly={readOnly}
      placeholder="Digite o valor numérico"
    />
  );
}
