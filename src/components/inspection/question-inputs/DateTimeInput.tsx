import React from "react";
import { Input } from "@/components/ui/input";

interface DateTimeInputProps {
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value = "",
  onChange,
  readOnly = false
}) => {
  return (
    <Input
      type="datetime-local"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      className="w-full"
    />
  );
};