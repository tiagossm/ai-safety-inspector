import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface ParagraphInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const ParagraphInput: React.FC<ParagraphInputProps> = ({
  value = "",
  onChange,
  placeholder = "Digite sua resposta...",
  readOnly = false
}) => {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[120px] resize-y"
      readOnly={readOnly}
    />
  );
};