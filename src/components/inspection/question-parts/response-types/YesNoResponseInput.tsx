
import React, { useCallback } from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";

interface YesNoResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  onMediaChange?: (urls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  readOnly?: boolean;
}

export function YesNoResponseInput({
  question,
  response = {},
  onResponseChange,
  inspectionId,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  readOnly = false
}: YesNoResponseInputProps) {
  // Garantir estrutura consistente do response
  const safeResponse = {
    value: response?.value,
    mediaUrls: Array.isArray(response?.mediaUrls) ? response.mediaUrls : [],
    mediaAnalysisResults: response?.mediaAnalysisResults || {},
    ...response
  };

  const currentValue = safeResponse.value;

  // Handler para mudança no valor da resposta
  const handleResponseChange = useCallback(
    (value: boolean) => {
      onResponseChange({ ...safeResponse, value });
    },
    [safeResponse, onResponseChange]
  );

  return (
    <ResponseButtonGroup
      value={currentValue}
      onChange={handleResponseChange}
      readOnly={readOnly}
    />
  );
}
