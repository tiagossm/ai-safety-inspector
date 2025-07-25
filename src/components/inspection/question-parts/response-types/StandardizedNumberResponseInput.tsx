import React from "react";
import { Input } from "@/components/ui/input";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse } from "@/utils/responseTypeStandardization";

interface StandardizedNumberResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onMediaChange?: (mediaUrls: string[]) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function StandardizedNumberResponseInput({
  min,
  max,
  step = 1,
  ...props
}: StandardizedNumberResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    const updatedResponse = {
      ...standardResponse,
      value: isNaN(numValue) ? null : numValue
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput {...props}>
      <Input
        type="number"
        value={standardResponse.value || ""}
        onChange={handleNumberChange}
        min={min}
        max={max}
        step={step}
        disabled={props.readOnly}
        className="w-full"
        placeholder="Digite um número..."
      />
    </BaseResponseInput>
  );
}