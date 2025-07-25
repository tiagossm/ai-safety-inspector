import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse } from "@/utils/responseTypeStandardization";

interface StandardizedDateResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onMediaChange?: (mediaUrls: string[]) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
}

export function StandardizedDateResponseInput(props: StandardizedDateResponseInputProps) {
  const [open, setOpen] = useState(false);
  const standardResponse = standardizeResponse(props.response);
  const selectedDate = standardResponse.value ? new Date(standardResponse.value) : undefined;

  const handleDateChange = (date: Date | undefined) => {
    setOpen(false);
    const updatedResponse = {
      ...standardResponse,
      value: date ? format(date, "yyyy-MM-dd") : ""
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            disabled={props.readOnly}
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
            disabled={props.readOnly}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </BaseResponseInput>
  );
}