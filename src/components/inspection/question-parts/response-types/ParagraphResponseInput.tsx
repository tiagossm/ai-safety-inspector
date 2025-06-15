
import React, { useCallback } from "react";

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
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text !== value) {
      onChange(text);
    }
  }, [value, onChange]);

  return (
    <textarea
      className="w-full border rounded p-2 text-sm"
      rows={4}
      placeholder="Digite sua resposta..."
      value={value}
      onChange={handleChange}
      disabled={readOnly}
    />
  );
}
