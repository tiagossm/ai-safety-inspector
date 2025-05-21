
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MediaUploadButton } from "@/components/inspection/question-inputs/MediaUploadButton";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface DateResponseInputProps {
  value: string;
  onChange: (value: string) => void;
  onMediaUpload?: () => void;
  allowsMedia?: boolean;
  disabled?: boolean;
}

export function DateResponseInput({
  value,
  onChange,
  onMediaUpload,
  allowsMedia = false,
  disabled = false,
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
          disabled={disabled}
          locale={ptBR}
          className="border rounded-md p-3"
        />
      </div>
      
      {allowsMedia && onMediaUpload && (
        <div className="flex justify-start mt-2">
          <MediaUploadButton
            type="photo"
            onClick={onMediaUpload}
            disabled={disabled}
          />
        </div>
      )}
    </ResponseWrapper>
  );
}
