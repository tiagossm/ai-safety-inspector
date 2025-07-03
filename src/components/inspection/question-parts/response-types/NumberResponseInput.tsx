
import React, { useState, useCallback } from 'react';
import { ActionPlanButton } from './components/ActionPlanButton';
import { ActionPlan5W2HDialog } from '@/components/action-plans/ActionPlan5W2HDialog';
import { MediaUploadInput } from '@/components/inspection/question-inputs/MediaUploadInput';
import { MediaAttachments } from '@/components/inspection/question-inputs/MediaAttachments';

interface NumberResponseInputProps {
  question?: any;
  value?: number;
  response?: any;
  onChange: (value: number) => void;
  onResponseChange?: (data: any) => void;
  min?: number;
  max?: number;
  step?: number;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onMediaChange?: (mediaUrls: string[]) => void;
  readOnly?: boolean;
}

export function NumberResponseInput({
  question,
  value = 0,
  response,
  onChange,
  onResponseChange,
  min,
  max,
  step = 1,
  inspectionId,
  actionPlan,
  onSaveActionPlan,
  onMediaChange,
  readOnly = false
}: NumberResponseInputProps) {
  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, any>>(
    response?.mediaAnalysisResults || {}
  );

  // Usar o valor diretamente ou via response object
  const currentValue = value !== undefined ? value : (response?.value || 0);
  const mediaUrls = response?.mediaUrls || [];

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value, 10);
    
    if (onResponseChange) {
      onResponseChange({
        ...response,
        value: numValue
      });
    } else {
      onChange(numValue);
    }
  };

  const handleMediaChange = useCallback((newMediaUrls: string[]) => {
    console.log("[NumberResponseInput] handleMediaChange:", newMediaUrls);
    
    if (onMediaChange) {
      onMediaChange(newMediaUrls);
    } else if (onResponseChange && response) {
      onResponseChange({
        ...response,
        mediaUrls: newMediaUrls
      });
    }
  }, [response, onResponseChange, onMediaChange]);

  const handleSaveAnalysis = useCallback((url: string, result: any) => {
    console.log("[NumberResponseInput] handleSaveAnalysis:", url, result);
    
    const newResults = {
      ...mediaAnalysisResults,
      [url]: result
    };
    
    setMediaAnalysisResults(newResults);
    
    if (onResponseChange && response) {
      onResponseChange({
        ...response,
        mediaAnalysisResults: newResults
      });
    }
  }, [response, onResponseChange, mediaAnalysisResults]);

  const handleDeleteMedia = useCallback((urlToDelete: string) => {
    if (onMediaChange) {
      onMediaChange(mediaUrls.filter(url => url !== urlToDelete));
    } else if (onResponseChange && response) {
      onResponseChange({
        ...response,
        mediaUrls: mediaUrls.filter(url => url !== urlToDelete)
      });
    }
  }, [mediaUrls, onMediaChange, onResponseChange, response]);

  return (
    <div className="flex flex-col space-y-4">
      <input
        type="number"
        className="border rounded-md px-3 py-2 text-gray-900"
        value={currentValue}
        onChange={handleNumericChange}
        min={min}
        max={max}
        step={step}
        disabled={readOnly}
      />
      
      {question && (
        <>
          <div className="flex flex-wrap gap-2">
            <ActionPlanButton
              onActionPlanClick={() => setIsActionPlanDialogOpen(true)}
              readOnly={readOnly}
            />
          </div>

          {mediaUrls.length > 0 && (
            <MediaAttachments
              mediaUrls={mediaUrls}
              onDelete={!readOnly ? handleDeleteMedia : undefined}
              onOpenPreview={() => {}}
              onOpenAnalysis={() => {}}
              readOnly={readOnly}
              questionText={question.text || question.pergunta || ""}
              analysisResults={mediaAnalysisResults}
              onSaveAnalysis={handleSaveAnalysis}
            />
          )}

          <MediaUploadInput
            allowsPhoto={question.allowsPhoto || question.permite_foto || false}
            allowsVideo={question.allowsVideo || question.permite_video || false}
            allowsAudio={question.allowsAudio || question.permite_audio || false}
            allowsFiles={question.allowsFiles || question.permite_files || false}
            mediaUrls={mediaUrls}
            onMediaChange={handleMediaChange}
            readOnly={readOnly}
            questionText={question.text || question.pergunta || ""}
            onSaveAnalysis={handleSaveAnalysis}
            analysisResults={mediaAnalysisResults}
          />

          <ActionPlan5W2HDialog
            open={isActionPlanDialogOpen}
            onOpenChange={setIsActionPlanDialogOpen}
            questionId={question?.id}
            inspectionId={inspectionId}
            existingPlan={actionPlan}
            onSave={async (data: any) => {
              await onSaveActionPlan?.(data);
              setIsActionPlanDialogOpen(false);
            }}
            iaSuggestions={mediaAnalysisResults}
          />
        </>
      )}
    </div>
  );
}
