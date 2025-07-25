import React from "react";
import { Input } from "@/components/ui/input";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse } from "@/utils/responseTypeStandardization";

interface StandardizedDateTimeResponseInputProps {
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

export function StandardizedDateTimeResponseInput(props: StandardizedDateTimeResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedResponse = {
      ...standardResponse,
      value: e.target.value
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput {...props}>
      <Input
        type="datetime-local"
        value={standardResponse.value || ""}
        onChange={handleDateTimeChange}
        disabled={props.readOnly}
        className="w-full"
      />
    </BaseResponseInput>
  );
}