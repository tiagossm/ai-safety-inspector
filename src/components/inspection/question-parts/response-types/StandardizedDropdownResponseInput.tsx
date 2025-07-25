import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse, standardizeQuestion } from "@/utils/responseTypeStandardization";

interface StandardizedDropdownResponseInputProps {
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

export function StandardizedDropdownResponseInput(props: StandardizedDropdownResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);
  const standardQuestion = standardizeQuestion(props.question);

  const handleDropdownChange = (value: string) => {
    const updatedResponse = {
      ...standardResponse,
      value
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput {...props}>
      <Select
        value={standardResponse.value || ""}
        onValueChange={handleDropdownChange}
        disabled={props.readOnly}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma opção..." />
        </SelectTrigger>
        <SelectContent>
          {(standardQuestion.options || []).map((option: string, index: number) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BaseResponseInput>
  );
}