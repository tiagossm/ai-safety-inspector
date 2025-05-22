import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface DateResponseInputProps {
  value?: string | { value: string; mediaUrls?: string[] }; // permite objeto ou string
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function DateResponseInput({
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: DateResponseInputProps) {
  // Extrair string de data se o valor vier como objeto
  const dateValue = typeof value === "string" ? value : value?.value ?? "";

  const selectedDate = dateValue ? parseISO(dateValue) : undefined;

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
  };

  const [open, setOpen] = useState(false);

  return (
    <ResponseWrapper>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            disabled={disabled || readOnly}
            tabIndex={0}
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
            onSelect={(date) => {
              setOpen(false);
              handleDateChange(date);
            }}
            disabled={disabled || readOnly}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {/* Campo oculto para garantir formato yyyy-MM-dd se necessário */}
      <input type="hidden" value={dateValue} />
    </ResponseWrapper>
  );
}
