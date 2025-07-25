import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse, standardizeQuestion } from "@/utils/responseTypeStandardization";

interface StandardizedMultipleChoiceResponseInputProps {
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

export function StandardizedMultipleChoiceResponseInput(props: StandardizedMultipleChoiceResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);
  const standardQuestion = standardizeQuestion(props.question);

  const handleMultipleChoiceChange = (value: string) => {
    const updatedResponse = {
      ...standardResponse,
      value
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput {...props}>
      <RadioGroup
        value={standardResponse.value || ""}
        onValueChange={handleMultipleChoiceChange}
        disabled={props.readOnly}
        className="space-y-2"
      >
        {(standardQuestion.options || []).map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="text-sm">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </BaseResponseInput>
  );
}