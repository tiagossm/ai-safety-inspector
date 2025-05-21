
import React from "react";
import { Input } from "@/components/ui/input";
import { MediaUploadButton } from "@/components/inspection/question-inputs/MediaUploadButton";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface TimeResponseInputProps {
  value?: string;
  onChange: (value: string) => void;
  onMediaUpload?: () => void;
  allowsMedia?: boolean;
  disabled?: boolean;
  question?: any;
  response?: any;
  onMediaChange?: (urls: string[]) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
}

export function TimeResponseInput({
  value,
  onChange,
  onMediaUpload,
  allowsMedia = false,
  disabled = false,
  question,
  response,
  onMediaChange,
  readOnly = false
}: TimeResponseInputProps) {
  // Use o value direto se fornecido, ou tente pegar de response.value se existir
  const currentValue = value || (response?.value || "");

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
      
      {allowsMedia && onMediaUpload && !readOnly && (
        <div className="flex justify-start mt-2">
          <MediaUploadButton
            type="photo"
            onClick={onMediaUpload}
            disabled={disabled || readOnly}
          />
        </div>
      )}
    </ResponseWrapper>
  );
}
