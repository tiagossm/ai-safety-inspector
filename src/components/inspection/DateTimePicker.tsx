import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  className,
}: DateTimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP 'às' HH:mm", { locale: ptBR }) : <span>Selecione uma data e hora</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            if (newDate) {
              // Keep the time part if a date is already selected
              if (date) {
                newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
              } else {
                // Default to current time if no date was previously selected
                const now = new Date();
                newDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
              }
              setDate(newDate);
            } else {
              setDate(undefined);
            }
          }}
          initialFocus
        />
        <div className="p-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm">Hora:</span>
            <div className="flex space-x-2">
              <input
                type="time"
                value={date ? format(date, "HH:mm") : ""}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [hours, minutes] = e.target.value.split(":").map(Number);
                  const newDate = new Date(date || new Date());
                  newDate.setHours(hours, minutes, 0, 0);
                  setDate(newDate);
                }}
                className="border rounded px-2 py-1 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDate(undefined)}
                className="text-xs"
              >
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
