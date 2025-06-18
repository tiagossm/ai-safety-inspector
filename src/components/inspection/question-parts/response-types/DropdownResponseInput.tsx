
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
  // Tentar pegar as opções de diferentes campos possíveis
  const options = question.options || question.opcoes || [];
  
  // Se options for uma string JSON, tentar fazer parse
  let parsedOptions = options;
  if (typeof options === 'string') {
    try {
      parsedOptions = JSON.parse(options);
    } catch (e) {
      console.warn('Erro ao fazer parse das opções:', e);
      parsedOptions = [];
    }
  }

  // Garantir que seja um array
  if (!Array.isArray(parsedOptions)) {
    parsedOptions = [];
  }

  if (parsedOptions.length === 0) {
    return (
      <div className="text-xs text-red-600">
        Nenhuma opção configurada para este dropdown.
      </div>
    );
  }

  return (
    <select
      className="border rounded px-3 py-2 w-full"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      disabled={readOnly}
    >
      <option value="">Selecione...</option>
      {parsedOptions.map((option: string, idx: number) => (
        <option key={idx} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
