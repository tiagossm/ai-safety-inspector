
// Corrigir bug do campo de texto perdendo o foco (deveria só renderizar um controlled input)
import React, { useRef } from "react";

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
  // Garantir sempre controlled; o bug ocorre se o componente for recriado a cada tecla pela key ou outra prop inesperada.
  // Aqui, garantimos controlled.
  return (
    <textarea
      className="w-full border rounded p-2 text-sm"
      rows={4}
      placeholder="Digite sua resposta..."
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={readOnly}
      autoFocus={false}
      // Importante: não usar key dinâmica
    />
  );
}
