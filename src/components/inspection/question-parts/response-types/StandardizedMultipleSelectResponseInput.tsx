import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse, standardizeQuestion } from "@/utils/responseTypeStandardization";

interface StandardizedMultipleSelectResponseInputProps {
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

export function StandardizedMultipleSelectResponseInput(props: StandardizedMultipleSelectResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);
  const standardQuestion = standardizeQuestion(props.question);
  const selectedValues = Array.isArray(standardResponse.value) ? standardResponse.value : [];

  const handleMultipleSelectChange = (option: string, checked: boolean) => {
    let updatedValues: string[];
    
    if (checked) {
      updatedValues = [...selectedValues, option];
    } else {
      updatedValues = selectedValues.filter(value => value !== option);
    }
    
    const updatedResponse = {
      ...standardResponse,
      value: updatedValues
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput {...props}>
      <div className="space-y-2">
        {(standardQuestion.options || []).map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${index}`}
              checked={selectedValues.includes(option)}
              onCheckedChange={(checked) => handleMultipleSelectChange(option, checked as boolean)}
              disabled={props.readOnly}
            />
            <Label htmlFor={`checkbox-${index}`} className="text-sm">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </BaseResponseInput>
  );
}