
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: TextInputProps) {
  return (
    <div className="mt-2">
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite sua resposta..."
        rows={2}
        className="text-sm"
      />
    </div>
  );
}
