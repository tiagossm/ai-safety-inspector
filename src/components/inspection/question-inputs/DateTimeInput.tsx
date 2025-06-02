
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimeInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function DateTimeInput({ value, onChange, readOnly = false }: DateTimeInputProps) {
  // Converte valor ISO para formato datetime-local
  const formatForInput = (isoString: string | undefined): string => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  // Converte de datetime-local para ISO
  const handleChange = (inputValue: string) => {
    if (!inputValue) {
      onChange("");
      return;
    }
    
    try {
      const date = new Date(inputValue);
      onChange(date.toISOString());
    } catch {
      onChange(inputValue); // Fallback para valor original
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <Label className="text-sm font-medium">Data e Hora</Label>
      <Input
        type="datetime-local"
        value={formatForInput(value)}
        onChange={(e) => handleChange(e.target.value)}
        className="text-sm"
        readOnly={readOnly}
      />
      {value && (
        <div className="text-xs text-gray-500">
          Valor: {new Date(value).toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
}
