
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
}

export function TextInput({ value, onChange, multiline = false }: TextInputProps) {
  return (
    <div className="mt-2">
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite sua resposta..."
        rows={multiline ? 4 : 2}
        className="text-sm"
      />
    </div>
  );
}
