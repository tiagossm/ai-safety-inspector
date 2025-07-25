import React from 'react';
import { ResponseInputRenderer } from './ResponseInputRenderer';

interface ResponseInputProps {
  question: any;
  value?: any;
  onChange: (value: any) => void;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
}

export function ResponseInput({ 
  question, 
  value, 
  onChange,
  inspectionId,
  actionPlan,
  onSaveActionPlan
}: ResponseInputProps) {
  return (
    <ResponseInputRenderer
      question={question}
      response={value}
      onResponseChange={onChange}
      inspectionId={inspectionId}
      actionPlan={actionPlan}
      onSaveActionPlan={onSaveActionPlan}
    />
  );
}