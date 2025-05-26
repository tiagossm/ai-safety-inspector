
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
  console.log('[ResponseInput] Rendering with question:', question.id);
  console.log('[ResponseInput] Question response type:', question.responseType || question.tipo_resposta);
  console.log('[ResponseInput] Current value:', value);

  // Garantir que temos sempre um objeto de resposta válido
  const responseObject = typeof value === 'object' && value !== null
    ? value
    : { value: value, mediaUrls: [] };

  const handleValueChange = useCallback((newValue: any) => {
    console.log('[ResponseInput] Value changed:', newValue);
    onChange(newValue);
  }, [onChange]);

  const handleMediaChange = useCallback((urls: string[]) => {
    console.log('[ResponseInput] Media changed:', urls);
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
