
import React from "react";
import { Input } from "@/components/ui/input";

interface DateInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function DateInput({ value, onChange, readOnly = false }: DateInputProps) {
  return (
    <div className="mt-2">
      <Input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm"
        readOnly={readOnly}
      />
    </div>
  );
}
