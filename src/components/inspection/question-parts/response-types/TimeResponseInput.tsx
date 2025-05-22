// src/components/inputs/TimeResponseInput.tsx
import React from "react";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface TimeResponseInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * Componente de input para resposta do tipo "hora" (HH:mm).
 * Suporta modo readOnly, integração fácil com form handlers e estilização plug and play.
 */
export function TimeResponseInput({
  value,
  onChange,
  disabled = false,
  readOnly = false
}: TimeResponseInputProps) {
  return (
    <ResponseWrapper>
      <input
        type="time"
        className="w-full border rounded p-2"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || readOnly}
        readOnly={readOnly}
      />
    </ResponseWrapper>
  );
}
