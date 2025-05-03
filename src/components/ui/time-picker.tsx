
import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TimePickerProps {
  date: Date
  setDate: (date: Date) => void
}

export function TimePickerDemo({ date, setDate }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)

  const [hour, setHour] = React.useState<string>(
    date ? date.getHours().toString().padStart(2, "0") : ""
  )
  const [minute, setMinute] = React.useState<string>(
    date ? date.getMinutes().toString().padStart(2, "0") : ""
  )

  const handleHourChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10)
    
    if (isNaN(value)) {
      setHour("")
      return
    }
    
    const newVal = Math.max(0, Math.min(23, value))
    setHour(newVal.toString().padStart(2, "0"))
    
    if (event.target.value.length >= 2) {
      minuteRef.current?.focus()
    }

    updateDate(newVal, parseInt(minute))
  }

  const handleMinuteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10)
    
    if (isNaN(value)) {
      setMinute("")
      return
    }
    
    const newVal = Math.max(0, Math.min(59, value))
    setMinute(newVal.toString().padStart(2, "0"))
    
    updateDate(parseInt(hour), newVal)
  }

  const updateDate = (h: number, m: number) => {
    if (isNaN(h) || isNaN(m)) return
    
    const newDate = new Date(date)
    newDate.setHours(h)
    newDate.setMinutes(m)
    setDate(newDate)
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs">Horário</Label>
      <div className="flex gap-1 items-center justify-center">
        <Input
          ref={hourRef}
          value={hour}
          onChange={handleHourChange}
          className="w-12 text-center"
          placeholder="00"
          maxLength={2}
        />
        <span className="text-lg">:</span>
        <Input
          ref={minuteRef}
          value={minute}
          onChange={handleMinuteChange}
          className="w-12 text-center"
          placeholder="00"
          maxLength={2}
        />
      </div>
    </div>
  )
}
