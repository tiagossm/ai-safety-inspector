
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
  const responseType = question.responseType;
  
  if (responseType === "sim/não" || responseType === "yes_no") {
    return <YesNoInput value={response?.value} onChange={onResponseChange} />;
  } else if (responseType === "numérico" || responseType === "numeric") {
    return <NumberInput value={response?.value} onChange={onResponseChange} />;
  } else if (responseType === "texto" || responseType === "text") {
    return <TextInput value={response?.value} onChange={onResponseChange} />;
  } else if (responseType === "seleção múltipla" || responseType === "multiple_choice") {
    return <MultipleChoiceInput options={question.options || []} value={response?.value} onChange={onResponseChange} />;
  } else if (responseType === "foto" || responseType === "photo") {
    return <PhotoInput onAddMedia={onAddMedia} mediaUrls={response?.mediaUrls} />;
  } else {
    return <p className="text-sm text-muted-foreground mt-2">Tipo de resposta não suportado: {responseType}</p>;
  }
}
