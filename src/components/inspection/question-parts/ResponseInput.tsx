
import React from 'react';
import { UnifiedResponseInput } from './UnifiedResponseInput';

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
  // Garantir que responseObject seja sempre o mesmo caso o value não mude
  const responseObject = React.useMemo(() => {
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    return { value, mediaUrls: [] };
  }, [value]);

  const handleValueChange = React.useCallback((newValue: any) => {
    if (typeof newValue === "object" && newValue !== null) {
      onChange(newValue);
    } else {
      onChange({ ...responseObject, value: newValue });
    }
  }, [responseObject, onChange]);

  const handleMediaChange = React.useCallback((urls: string[]) => {
    onChange({
      ...responseObject,
      mediaUrls: urls
    });
  }, [responseObject, onChange]);

  return (
    <UnifiedResponseInput
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
