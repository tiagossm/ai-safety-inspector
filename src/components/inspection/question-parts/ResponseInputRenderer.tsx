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
import { StandardizedPhotoResponseInput } from "./response-types/StandardizedPhotoResponseInput";
import { StandardizedSignatureResponseInput } from "./response-types/StandardizedSignatureResponseInput";
import { standardizeResponse, standardizeQuestion } from "@/utils/responseTypeStandardization";
import { debugResponseFlow, debugTypeMapping } from "@/utils/debugUtils";

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
  const standardResponse = standardizeResponse(response);
  const responseType = standardQuestion.responseType;
  
  // Debug logs detalhados
  debugTypeMapping(
    question?.tipo_resposta || 'undefined', 
    responseType,
    { questionText: standardQuestion.pergunta }
  );
  
  debugResponseFlow('Input Response', {
    original: response,
    standardized: standardResponse
  });

  // Wrapper para garantir que a resposta seja sempre no formato padronizado
  const handleResponseChange = (data: any) => {
    debugResponseFlow('Saving Response', data);
    onResponseChange(data);
  };

  // Props comuns para todos os componentes padronizados
  const commonProps = {
    question: standardQuestion,
    response: standardResponse,
    onResponseChange: handleResponseChange,
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

  if (responseType === "photo") {
    return <StandardizedPhotoResponseInput {...commonProps} />;
  }

  if (responseType === "signature") {
    return <StandardizedSignatureResponseInput {...commonProps} />;
  }

  return (
    <div className="p-4 border border-red-300 bg-red-50 rounded-md">
      <p className="text-red-700">
        Tipo de resposta não suportado: {responseType} (original: {standardQuestion.tipo_resposta})
      </p>
    </div>
  );
};