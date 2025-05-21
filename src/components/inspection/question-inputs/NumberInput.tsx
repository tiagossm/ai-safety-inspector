import React from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function NumberInput({ value, onChange }: NumberInputProps) {
  return (
    <div className="mt-2">
      <Input
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? undefined : Number(v));
        }}
        placeholder="Digite um valor numérico..."
        className="text-sm"
      />
    </div>
  );
}
