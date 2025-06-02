
import React from "react";
import { Input } from "@/components/ui/input";

interface TimeInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function TimeInput({ value, onChange, readOnly = false }: TimeInputProps) {
  return (
    <div className="mt-2">
      <Input
        type="time"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm"
        readOnly={readOnly}
      />
    </div>
  );
}
