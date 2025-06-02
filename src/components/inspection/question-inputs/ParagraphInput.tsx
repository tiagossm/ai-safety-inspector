
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface ParagraphInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minRows?: number;
  maxLength?: number;
}

export function ParagraphInput({ 
  value, 
  onChange, 
  placeholder = "Digite sua resposta...",
  readOnly = false,
  minRows = 3,
  maxLength
}: ParagraphInputProps) {
  return (
    <div className="mt-2">
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-sm min-h-[80px] resize-y"
        rows={minRows}
        readOnly={readOnly}
        maxLength={maxLength}
      />
      {maxLength && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {(value?.length || 0)}/{maxLength} caracteres
        </div>
      )}
    </div>
  );
}
