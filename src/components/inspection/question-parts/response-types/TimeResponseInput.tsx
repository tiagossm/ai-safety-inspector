
import React from "react";
import { Input } from "@/components/ui/input";
import { MediaUploadButton } from "@/components/inspection/question-inputs/MediaUploadButton";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface TimeResponseInputProps {
  value: string;
  onChange: (value: string) => void;
  onMediaUpload?: () => void;
  allowsMedia?: boolean;
  disabled?: boolean;
}

export function TimeResponseInput({
  value,
  onChange,
  onMediaUpload,
  allowsMedia = false,
  disabled = false,
}: TimeResponseInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <ResponseWrapper>
      <Input
        type="time"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full"
      />
      
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
