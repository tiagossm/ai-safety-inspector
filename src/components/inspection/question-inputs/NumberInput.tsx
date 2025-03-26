
import React from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function NumberInput({ value, onChange }: NumberInputProps) {
  return (
    <div className="mt-2">
      <Input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite um valor numérico..."
        className="text-sm"
      />
    </div>
  );
}
