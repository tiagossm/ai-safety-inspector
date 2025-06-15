
import React from "react";

interface ParagraphResponseInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function ParagraphResponseInput({
  value = "",
  onChange,
  readOnly = false
}: ParagraphResponseInputProps) {
  return (
    <textarea
      className="w-full border rounded p-2 text-sm"
      rows={4}
      placeholder="Digite sua resposta..."
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={readOnly}
    />
  );
}
