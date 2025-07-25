import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse } from "@/utils/responseTypeStandardization";

interface StandardizedParagraphResponseInputProps {
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

export function StandardizedParagraphResponseInput(props: StandardizedParagraphResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);

  const handleParagraphChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedResponse = {
      ...standardResponse,
      value: e.target.value
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput {...props}>
      <Textarea
        value={standardResponse.value || ""}
        onChange={handleParagraphChange}
        placeholder="Digite sua resposta..."
        rows={4}
        disabled={props.readOnly}
        className="w-full"
      />
    </BaseResponseInput>
  );
}