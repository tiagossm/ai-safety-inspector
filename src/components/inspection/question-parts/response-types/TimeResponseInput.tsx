import React from "react";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface TimeResponseInputProps {
  value?: string; // Formato esperado: "HH:mm" ou "HH:mm:ss"
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * Componente para input do tipo "hora" no formato HH:mm.
 * Fácil integração, suporte a disabled e readOnly.
 */
export function TimeResponseInput({
  value = "",
  onChange,
  disabled = false,
  readOnly = false,
}: TimeResponseInputProps) {
  // Garante que só a string no formato "HH:mm" será passada para o onChange
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <ResponseWrapper>
      <input
        type="time"
        value={value}
        onChange={handleChange}
        disabled={disabled || readOnly}
        className="w-full rounded border px-2 py-1"
        step={1} // permite segundos, opcional
      />
    </ResponseWrapper>
  );
}
