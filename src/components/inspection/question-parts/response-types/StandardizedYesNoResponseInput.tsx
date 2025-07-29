import React from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse } from "@/utils/responseTypeStandardization";

interface StandardizedYesNoResponseInputProps {
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

export function StandardizedYesNoResponseInput(props: StandardizedYesNoResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);

  const handleResponseChange = (value: boolean) => {
    const updatedResponse = {
      ...standardResponse,
      value
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput {...props}>
      <ResponseButtonGroup 
        value={standardResponse.value} 
        onChange={handleResponseChange} 
        readOnly={props.readOnly}
      />
    </BaseResponseInput>
  );
}