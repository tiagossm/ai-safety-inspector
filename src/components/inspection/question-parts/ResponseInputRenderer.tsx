import React from "react";
import { StandardizedYesNoResponseInput } from "./response-types/StandardizedYesNoResponseInput";
import { StandardizedTextResponseInput } from "./response-types/StandardizedTextResponseInput";
import { StandardizedDateResponseInput } from "./response-types/StandardizedDateResponseInput";
import { StandardizedTimeResponseInput } from "./response-types/StandardizedTimeResponseInput";
import { StandardizedNumberResponseInput } from "./response-types/StandardizedNumberResponseInput";
import { StandardizedMultipleChoiceResponseInput } from "./response-types/StandardizedMultipleChoiceResponseInput";
import { StandardizedParagraphResponseInput } from "./response-types/StandardizedParagraphResponseInput";
import { StandardizedDropdownResponseInput } from "./response-types/StandardizedDropdownResponseInput";
import { StandardizedMultipleSelectResponseInput } from "./response-types/StandardizedMultipleSelectResponseInput";
import { StandardizedDateTimeResponseInput } from "./response-types/StandardizedDateTimeResponseInput";
import { standardizeResponse, standardizeQuestion } from "@/utils/responseTypeStandardization";

interface ResponseInputRendererProps {
  question: any;
  response: any;
  inspectionId?: string;
  onResponseChange: (value: any) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
}

export const ResponseInputRenderer: React.FC<ResponseInputRendererProps> = ({
  question,
  response,
  inspectionId,
  onResponseChange,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  onApplyAISuggestion,
  readOnly = false
}) => {
  // Padronizar questão e resposta
  const standardQuestion = standardizeQuestion(question);
  const responseType = standardQuestion.responseType;
  
  console.log("ResponseInputRenderer: rendering with responseType:", responseType);

  // Props comuns para todos os componentes padronizados
  const commonProps = {
    question: standardQuestion,
    response,
    onResponseChange,
    inspectionId,
    actionPlan,
    onSaveActionPlan,
    onMediaChange,
    onApplyAISuggestion,
    readOnly
  };

  if (responseType === "yes_no") {
    return <StandardizedYesNoResponseInput {...commonProps} />;
  }

  if (responseType === "text") {
    return <StandardizedTextResponseInput {...commonProps} />;
  }

  if (responseType === "paragraph") {
    return <StandardizedParagraphResponseInput {...commonProps} />;
  }

  if (responseType === "dropdown") {
    return <StandardizedDropdownResponseInput {...commonProps} />;
  }

  if (responseType === "multiple_select") {
    return <StandardizedMultipleSelectResponseInput {...commonProps} />;
  }

  if (responseType === "datetime") {
    return <StandardizedDateTimeResponseInput {...commonProps} />;
  }

  if (responseType === "multiple_choice") {
    return <StandardizedMultipleChoiceResponseInput {...commonProps} />;
  }

  if (responseType === "numeric") {
    return <StandardizedNumberResponseInput {...commonProps} />;
  }

  if (responseType === "date") {
    return <StandardizedDateResponseInput {...commonProps} />;
  }

  if (responseType === "time") {
    return <StandardizedTimeResponseInput {...commonProps} />;
  }

  return (
    <div className="p-4 border border-red-300 bg-red-50 rounded-md">
      <p className="text-red-700">
        Tipo de resposta não suportado: {responseType} (original: {standardQuestion.tipo_resposta})
      </p>
    </div>
  );
};