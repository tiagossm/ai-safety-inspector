
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
  
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    onResponseChange({ 
      ...response, 
      value: e.target.value 
    });
  }, [readOnly, response, onResponseChange]);

  return (
    <textarea
      className="w-full border rounded p-2 text-sm"
      rows={3}
      placeholder="Digite sua resposta..."
      value={response?.value || ''}
      onChange={handleTextChange}
      disabled={readOnly}
    />
  );
};
