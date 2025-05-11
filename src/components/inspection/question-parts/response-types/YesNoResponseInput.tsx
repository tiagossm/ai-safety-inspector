
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
  
  console.log("YesNoResponseInput: rendering with response:", response);
  
  // Extract current value from response or default to undefined
  const currentValue = response?.value;
  
  // Handle local response changes
  const handleResponseChange = useCallback((value: boolean) => {
    console.log("YesNoResponseInput: value changed to:", value);
    const updatedResponse = {
      ...response,
      value
    };
    console.log("YesNoResponseInput: response value changed:", updatedResponse);
    onResponseChange(updatedResponse);
  }, [response, onResponseChange]);
  
  // Handle media changes
  const handleMediaChange = useCallback((mediaUrls: string[]) => {
    console.log("YesNoResponseInput: media changed:", mediaUrls);
    if (onMediaChange) {
      onMediaChange(mediaUrls);
    } else {
      const updatedResponse = {
        ...response,
        mediaUrls
      };
      onResponseChange(updatedResponse);
    }
  }, [response, onResponseChange, onMediaChange]);
  
  // Handle the AI analysis results
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
    
    // Apply any suggestions if available
    if (results.actionPlanSuggestion && onApplyAISuggestion) {
      onApplyAISuggestion(results.actionPlanSuggestion);
    }
  }, [response, onResponseChange, onApplyAISuggestion]);

  // Handle opening the analysis dialog for a specific media
  const handleOpenAnalysis = useCallback(() => {
    // If we have media URLs, select the first one by default
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
        mediaUrls={response?.mediaUrls || []}
        onMediaChange={handleMediaChange}
        readOnly={readOnly}
      />
      
      <MediaAnalysisDialog
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        mediaUrl={selectedMediaUrl}
        mediaUrls={response?.mediaUrls || []}
        questionText={question.text || question.pergunta || ""}
        onAnalysisComplete={handleAnalysisResults}
        multimodalAnalysis={true}
      />
    </div>
  );
}
