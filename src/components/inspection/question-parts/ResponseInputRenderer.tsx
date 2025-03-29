
import React from "react";
import { YesNoInput } from "../question-inputs/YesNoInput";
import { TextInput } from "../question-inputs/TextInput";
import { NumberInput } from "../question-inputs/NumberInput";
import { MultipleChoiceInput } from "../question-inputs/MultipleChoiceInput";
import { PhotoInput } from "../question-inputs/PhotoInput";

interface ResponseInputRendererProps {
  question: any;
  response: any;
  onResponseChange: (value: any) => void;
  onAddMedia: () => void;
}

export function ResponseInputRenderer({
  question,
  response,
  onResponseChange,
  onAddMedia
}: ResponseInputRendererProps) {
  const responseType = question.responseType?.toLowerCase() || question.tipo_resposta?.toLowerCase();
  
  // Normalize response type to handle different formats
  if (responseType === "sim/não" || responseType === "yes_no" || responseType === "yes/no") {
    return <YesNoInput value={response?.value} onChange={onResponseChange} />;
  } else if (responseType === "numérico" || responseType === "numeric" || responseType === "number") {
    return <NumberInput value={response?.value} onChange={onResponseChange} />;
  } else if (responseType === "texto" || responseType === "text") {
    return <TextInput value={response?.value} onChange={onResponseChange} />;
  } else if (responseType === "seleção múltipla" || responseType === "multiple_choice") {
    return <MultipleChoiceInput 
      options={question.options || question.opcoes || []} 
      value={response?.value} 
      onChange={onResponseChange} 
    />;
  } else if (responseType === "foto" || responseType === "photo") {
    return <PhotoInput onAddMedia={onAddMedia} mediaUrls={response?.mediaUrls} />;
  } else {
    console.warn(`Unsupported response type: ${responseType} for question:`, question);
    return <p className="text-sm text-muted-foreground mt-2">Tipo de resposta não suportado: {responseType}</p>;
  }
}
