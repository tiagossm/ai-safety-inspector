import React from "react";
import { Input } from "@/components/ui/input";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface TimeResponseInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function TimeResponseInput({
  value,
  onChange,
  disabled = false,
  readOnly = false
}: TimeResponseInputProps) {
  const currentValue = value || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <ResponseWrapper>
      <Input
        type="time"
        value={currentValue}
        onChange={handleChange}
        disabled={disabled || readOnly}
        className="w-full"
      />
    </ResponseWrapper>
  );
}
