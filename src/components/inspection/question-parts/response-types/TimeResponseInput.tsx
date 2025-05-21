
import React from "react";
import { TimeInput } from "@/components/checklist/TimeInput";
import { PhotoInput } from "@/components/inspection/question-inputs/PhotoInput";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface TimeResponseInputProps {
  response: any;
  value?: string;
  onChange: (value: string) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  allowsMedia?: boolean;
  onMediaUpload?: () => void;
  readOnly?: boolean;
}

export function TimeResponseInput({
  response,
  value,
  onChange,
  onMediaChange,
  allowsMedia = false,
  onMediaUpload,
  readOnly = false
}: TimeResponseInputProps) {
  const mediaUrls = response?.mediaUrls || [];

  const handleMediaDelete = (urlToDelete: string) => {
    if (onMediaChange) {
      const updatedUrls = mediaUrls.filter((url: string) => url !== urlToDelete);
      onMediaChange(updatedUrls);
    }
  };

  return (
    <ResponseWrapper>
      <TimeInput
        value={value || ""}
        onChange={onChange}
      />
      
      {allowsMedia && (
        <PhotoInput
          mediaUrls={mediaUrls}
          onAddMedia={onMediaUpload || (() => {})}
          onDeleteMedia={handleMediaDelete}
        />
      )}
    </ResponseWrapper>
  );
}
