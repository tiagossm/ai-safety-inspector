import React from "react";
import { Input } from "@/components/ui/input";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse } from "@/utils/responseTypeStandardization";

interface StandardizedTimeResponseInputProps {
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

export function StandardizedTimeResponseInput(props: StandardizedTimeResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedResponse = {
      ...standardResponse,
      value: e.target.value
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput {...props}>
      <Input
        type="time"
        value={standardResponse.value || ""}
        onChange={handleTimeChange}
        disabled={props.readOnly}
        className="w-full"
      />
    </BaseResponseInput>
  );
}