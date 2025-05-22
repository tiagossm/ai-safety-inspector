import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  value: string | { value: string; mediaUrls?: string[] } | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
}

export function TextInput({ value, onChange, multiline = false }: TextInputProps) {
  const textValue = typeof value === "string" ? value : value?.value || "";
  return (
    <div className="mt-2">
      <Textarea
        value={textValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite sua resposta..."
        rows={multiline ? 4 : 2}
        className="text-sm"
      />
    </div>
  );
}
