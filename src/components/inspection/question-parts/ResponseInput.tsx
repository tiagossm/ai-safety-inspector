
import React from "react";
import { YesNoInput } from "../question-inputs/YesNoInput";
import { TextInput } from "../question-inputs/TextInput";
import { MultipleChoiceInput } from "../question-inputs/MultipleChoiceInput";
import { NumberInput } from "../question-inputs/NumberInput";

interface ResponseInputProps {
  question: any;
  value: any;
  onChange: (value: any) => void;
}

export function ResponseInput({ question, value, onChange }: ResponseInputProps) {
  if (!question) return null;
  
  switch (question.responseType) {
    case "yes_no":
      return <YesNoInput value={value} onChange={onChange} />;
    
    case "text":
      return <TextInput value={value} onChange={onChange} multiline={question.multiline} />;
    
    case "multiple_choice":
      return <MultipleChoiceInput options={question.options || []} value={value} onChange={onChange} />;
    
    case "number":
      return <NumberInput value={value} onChange={onChange} />;
    
    default:
      return <p className="text-sm text-muted-foreground">Tipo de resposta não suportado: {question.responseType}</p>;
  }
}
