import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface DateResponseInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function DateResponseInput({
  value,
  onChange,
  disabled = false,
  readOnly = false
}: DateResponseInputProps) {
  const selectedDate = value ? new Date(value) : undefined;

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
  };

  return (
    <ResponseWrapper>
      <div className="w-full">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          disabled={disabled || readOnly}
          locale={ptBR}
          className="border rounded-md p-3"
        />
      </div>
    </ResponseWrapper>
  );
}
