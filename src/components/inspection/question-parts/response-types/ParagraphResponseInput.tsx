
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface ParagraphResponseInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function ParagraphResponseInput({ 
  value, 
  onChange, 
  readOnly = false 
}: ParagraphResponseInputProps) {
  return (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      placeholder="Digite sua resposta..."
      className="min-h-[100px] resize-vertical"
    />
  );
}
