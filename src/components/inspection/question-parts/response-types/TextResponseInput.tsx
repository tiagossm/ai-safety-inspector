
import React, { useCallback } from "react";

interface TextResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (value: any) => void;
  readOnly?: boolean;
}

export const TextResponseInput: React.FC<TextResponseInputProps> = ({
  question,
  response,
  onResponseChange,
  readOnly = false
}) => {
  const value = response?.value ?? '';

  // Só atualiza se mudar de fato o texto
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    const newText = e.target.value;
    if (newText !== value) {
      onResponseChange({ ...response, value: newText });
    }
  }, [readOnly, response, value, onResponseChange]);

  return (
    <textarea
      className="w-full border rounded p-2 text-sm"
      rows={3}
      placeholder="Digite sua resposta..."
      value={value}
      onChange={handleTextChange}
      disabled={readOnly}
    />
  );
};
