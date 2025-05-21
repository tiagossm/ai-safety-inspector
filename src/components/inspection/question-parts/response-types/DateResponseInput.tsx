import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(value) : undefined;

  const handleDateChange = (date: Date | undefined) => {
    setOpen(false);
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
  };

  return (
    <ResponseWrapper>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            disabled={disabled || readOnly}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate
              ? format(selectedDate, "PPP", { locale: ptBR })
              : <span>Selecione uma data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateChange}
            disabled={disabled || readOnly}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </ResponseWrapper>
  );
}
