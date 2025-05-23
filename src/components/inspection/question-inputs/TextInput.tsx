
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  value: string | { value: string; mediaUrls?: string[] } | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
}

export function TextInput({ value, onChange, multiline = false }: TextInputProps) {
  // Extração segura do valor de texto
  const textValue = React.useMemo(() => {
    if (typeof value === "string") {
      return value;
    } else if (value && typeof value === "object" && "value" in value) {
      return typeof value.value === "string" ? value.value : "";
    }
    return "";
  }, [value]);

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
