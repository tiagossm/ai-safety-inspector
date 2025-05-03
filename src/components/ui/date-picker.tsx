
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimePickerDemo } from "./time-picker"

interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  className?: string
  showTimePicker?: boolean
}

export function DatePicker({ 
  date, 
  setDate, 
  className,
  showTimePicker = false
}: DatePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, showTimePicker ? "PPP HH:mm" : "PPP") : <span>Selecione uma data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            className="pointer-events-auto"
          />
          {showTimePicker && date && (
            <div className="border-t p-3 border-border">
              <TimePickerDemo 
                date={date} 
                setDate={(newDate) => setDate(newDate)} 
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
