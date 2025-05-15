import React, { useCallback, useState } from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { ActionPlanButton } from "./components/ActionPlanButton";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAnalysisButton } from "./components/MediaAnalysisButton";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";

interface YesNoResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  onMediaChange?: (mediaUrls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
}

export function YesNoResponseInput({
  question,
  response,
  onResponseChange,
  inspectionId,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  onApplyAISuggestion,
  readOnly = false
}: YesNoResponseInputProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

  console.log("[YesNoResponseInput] rendering with response:", response);

  const currentValue = response?.value;

  const handleResponseChange = useCallback((value: boolean) => {
    const updatedResponse = {
      ...response,
      value
    };
    onResponseChange(updatedResponse);
  }, [response, onResponseChange]);

  const handleMediaChange = useCallback((newMediaUrls: string[]) => {
    console.log("[YesNoResponseInput] handleMediaChange:", newMediaUrls);
    if (onMediaChange) {
      onMediaChange(newMediaUrls);
    } else {
      const updatedResponse = {
        ...response,
        mediaUrls: newMediaUrls
      };
      onResponseChange(updatedResponse);
    }
  }, [response, onResponseChange, onMediaChange]);

  const handleAnalysisResults = useCallback((results: any) => {
    console.log("YesNoResponseInput: analysis results:", results);
    const updatedResponse = {
      ...response,
      mediaAnalysisResults: {
        ...(response?.mediaAnalysisResults || {}),
        ...results
      }
    };
    onResponseChange(updatedResponse);

    if (results.actionPlanSuggestion && onApplyAISuggestion) {
      onApplyAISuggestion(results.actionPlanSuggestion);
    }
  }, [response, onResponseChange, onApplyAISuggestion]);

  const handleOpenAnalysis = useCallback(() => {
    if (response?.mediaUrls && response.mediaUrls.length > 0) {
      setSelectedMediaUrl(response.mediaUrls[0]);
    } else {
      setSelectedMediaUrl(null);
    }
    setIsAnalysisOpen(true);
  }, [response?.mediaUrls]);

  return (
    <div className="space-y-4">
      <ResponseButtonGroup 
        value={currentValue} 
        onChange={handleResponseChange} 
        readOnly={readOnly || false}
      />
      
      <div className="flex flex-wrap gap-2">
        <ActionPlanButton 
          localValue={currentValue} 
          onActionPlanClick={onSaveActionPlan ? () => onSaveActionPlan({}) : () => {}} 
          readOnly={readOnly || false}
        />

        {(question.allowsPhoto || question.allowsVideo || question.permite_foto || question.permite_video) && (
          <MediaAnalysisButton onOpenAnalysis={handleOpenAnalysis} />
        )}
      </div>

      <MediaUploadInput
        allowsPhoto={question.allowsPhoto || question.permite_foto || false}
        allowsVideo={question.allowsVideo || question.permite_video || false}
        allowsAudio={question.allowsAudio || question.permite_audio || false}
        allowsFiles={question.allowsFiles || question.permite_files || false}
        mediaUrls={response?.mediaUrls ?? []}
        onMediaChange={handleMediaChange}
        readOnly={readOnly}
      />

      <MediaAnalysisDialog
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        mediaUrl={selectedMediaUrl}
        mediaUrls={response?.mediaUrls ?? []}
        questionText={question.text || question.pergunta || ""}
        onAnalysisComplete={handleAnalysisResults}
        multimodalAnalysis={true}
      />
    </div>
  );
}
