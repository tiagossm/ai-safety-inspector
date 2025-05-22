import React from "react";
import { ResponseWrapper } from "./components/ResponseWrapper";

interface TimeResponseInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * Componente de input para resposta do tipo "hora" (HH:mm).
 * Suporta modo readOnly, integração fácil com form handlers e estilização plug and play.
 */
export function TimeResponseInput({
  value,
  onChange,
  disabled = false,
  readOnly = false
}: TimeResponseInputProps) {
  // Use o value direto se fornecido, ou tente pegar de response.value se existir
  const currentValue = value || (response?.value || "");

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
