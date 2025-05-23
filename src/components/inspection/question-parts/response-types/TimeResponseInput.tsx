
import React from "react";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface TimeResponseInputProps {
  value?: string | { value: string }; // Permite string ou objeto
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
  // Extrai valor de string ou objeto de maneira segura
  const timeValue = React.useMemo(() => {
    if (typeof value === "string") {
      return value;
    } else if (value && typeof value === "object" && "value" in value) {
      return typeof value.value === "string" ? value.value : "";
    }
    return "";
  }, [value]);

  // Garante que só a string no formato "HH:mm" será passada para o onChange
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <ResponseWrapper>
      <input
        type="time"
        value={timeValue}
        onChange={handleChange}
        disabled={disabled || readOnly}
        className="w-full rounded border px-2 py-1"
        step={1} // permite segundos, opcional
      />
    </ResponseWrapper>
  );
}
