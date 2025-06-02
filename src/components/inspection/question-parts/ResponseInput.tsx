
import React, { useCallback } from 'react';
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
  // Se não vier objeto, constrói o padrão
  const responseObject = typeof value === 'object'
    ? value
    : { value: value, mediaUrls: [] };

  const handleValueChange = useCallback((newValue: any) => {
    onChange(newValue);
  }, [onChange]);

  const handleMediaChange = useCallback((urls: string[]) => {
    onChange({
      ...responseObject,
      mediaUrls: urls
    });
  }, [onChange, responseObject]);

  return (
    <ResponseInputRenderer
      question={question}
      response={responseObject}
      inspectionId={inspectionId}
      onResponseChange={handleValueChange}
      onMediaChange={handleMediaChange}
      actionPlan={actionPlan}
      onSaveActionPlan={onSaveActionPlan}
    />
  );
}
