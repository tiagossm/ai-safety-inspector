
import React, { useState, useEffect } from "react";
import { ActionPlanFormData } from "@/components/action-plans/form/types";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";
import { ActionPlanDialog } from "@/components/action-plans/ActionPlanDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { toast } from "sonner";
import { AISuggestionPanel } from "../AISuggestionPanel";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { MediaAnalysisButton } from "./components/MediaAnalysisButton";
import { ActionPlanButton } from "./components/ActionPlanButton";

interface YesNoResponseInputProps {
  question: any;
  response: any;
  inspectionId?: string;
  onResponseChange: (data: any) => void;
  onMediaChange?: (urls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: ActionPlanFormData) => Promise<void>;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
}

// Define an interface for the analysis result object
interface AnalysisResultObject {
  actionPlanSuggestion?: string;
  [key: string]: any;
}

export function YesNoResponseInput({
  question,
  response,
  inspectionId,
  onResponseChange,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  onApplyAISuggestion,
  readOnly = false
}: YesNoResponseInputProps) {
  const [showActionPlanDialog, setShowActionPlanDialog] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);

  // Ensure we correctly initialize the component with the current response value
  const [localValue, setLocalValue] = useState<boolean | undefined>(response?.value);

  // Update local state when external response changes
  useEffect(() => {
    setLocalValue(response?.value);
    console.log('YesNoResponseInput: response value changed:', response?.value);
  }, [response?.value]);

  useEffect(() => {
    if (response?.mediaAnalysisResults) {
      const results = Object.values(response.mediaAnalysisResults);
      // Find the first result that contains an actionPlanSuggestion
      const resultWithSuggestion = results.find((r): r is AnalysisResultObject => 
        r !== null && typeof r === 'object' && 'actionPlanSuggestion' in r && typeof r.actionPlanSuggestion === 'string'
      );
      
      setAiSuggestion(resultWithSuggestion?.actionPlanSuggestion || null);
    } else {
      setAiSuggestion(null);
    }
  }, [response?.mediaAnalysisResults]);

  const handleRadioChange = (value: boolean) => {
    if (readOnly) return;
    
    console.log('YesNoResponseInput: handleRadioChange called with value:', value);
    console.log('YesNoResponseInput: current response before change:', response);
    
    // Update local state first for immediate visual feedback
    setLocalValue(value);
    
    // Create a new response object with updated value
    const updatedResponse = {
      ...(response || {}),
      value: value,
      // Preserve existing mediaUrls and analysis results
      mediaUrls: response?.mediaUrls || [],
      mediaAnalysisResults: response?.mediaAnalysisResults || {}
    };
    
    console.log('YesNoResponseInput: sending updated response:', updatedResponse);
    onResponseChange(updatedResponse);
  };

  const handleApplyAISuggestion = () => {
    if (onApplyAISuggestion && aiSuggestion) {
      console.log('YesNoResponseInput: applying AI suggestion:', aiSuggestion);
      onApplyAISuggestion(aiSuggestion);
      toast.success("Sugestão da IA aplicada");
    }
  };

  const handleMediaChange = (urls: string[]) => {
    console.log('YesNoResponseInput: handleMediaChange called with URLs:', urls);
    
    // Update the response with the new media URLs
    const updatedResponse = {
      ...(response || {}),
      mediaUrls: urls,
      value: localValue // Ensure we keep the current value when updating media URLs
    };
    
    if (onMediaChange) onMediaChange(urls);
    onResponseChange(updatedResponse);
  };

  const handleOpenAnalysisDialog = () => {
    setShowAnalysisDialog(true);
  };

  const handleFullAnalysisComplete = (result: MediaAnalysisResult) => {
    console.log('YesNoResponseInput: full analysis complete with result:', result);
    
    if (result.actionPlanSuggestion) {
      setAiSuggestion(result.actionPlanSuggestion);
      toast.info("Sugestão de plano de ação disponível pela IA");
    }
    
    // Update response with analysis result for all media
    const updatedResults = {
      ...(response?.mediaAnalysisResults || {}),
      'multimodal': result
    };
    
    onResponseChange({
      ...(response || {}),
      mediaAnalysisResults: updatedResults,
      // Preserve existing data
      mediaUrls: response?.mediaUrls || [],
      value: localValue // Ensure we keep the current value
    });
  };

  const questionText = question.text || question.pergunta || "";

  return (
    <div>
      <ResponseButtonGroup 
        value={localValue} 
        onChange={handleRadioChange} 
        readOnly={readOnly}
      />

      <div className="flex flex-wrap gap-2">
        <MediaAnalysisButton onOpenAnalysis={handleOpenAnalysisDialog} />
        
        {inspectionId && question.id && localValue === false && onSaveActionPlan && (
          <ActionPlanButton 
            localValue={localValue} 
            onActionPlanClick={() => setShowActionPlanDialog(true)} 
            readOnly={readOnly}
          />
        )}
      </div>

      <MediaUploadInput
        mediaUrls={response?.mediaUrls || []}
        onMediaChange={handleMediaChange}
        readOnly={readOnly}
        questionText={questionText}
        onSaveAnalysis={(url, result) => {
          console.log('YesNoResponseInput: saving analysis for URL:', url, result);
          const updatedResults = {
            ...(response?.mediaAnalysisResults || {}),
            [url]: result
          };
          onResponseChange({
            ...(response || {}),
            mediaAnalysisResults: updatedResults,
            // Preserve existing data
            mediaUrls: response?.mediaUrls || [],
            value: localValue // Ensure we keep the current value
          });
        }}
        analysisResults={response?.mediaAnalysisResults}
        onApplyAISuggestion={onApplyAISuggestion}
        allowsPhoto={question.allowsPhoto || question.permite_foto}
        allowsVideo={question.allowsVideo || question.permite_video}
        allowsAudio={question.allowsAudio || question.permite_audio}
        allowsFiles={question.allowsFiles || question.permite_files}
      />

      {aiSuggestion && localValue === false && (
        <AISuggestionPanel 
          suggestion={aiSuggestion} 
          onApply={handleApplyAISuggestion}
        />
      )}

      {inspectionId && question.id && onSaveActionPlan && (
        <ActionPlanDialog
          open={showActionPlanDialog}
          onOpenChange={setShowActionPlanDialog}
          inspectionId={inspectionId}
          questionId={question.id}
          existingPlan={actionPlan}
          onSave={onSaveActionPlan}
          aiSuggestion={aiSuggestion}
        />
      )}

      <MediaAnalysisDialog
        open={showAnalysisDialog}
        onOpenChange={setShowAnalysisDialog}
        mediaUrl={null}
        questionText={questionText}
        responseValue={localValue}
        mediaUrls={response?.mediaUrls || []}
        onAnalysisComplete={handleFullAnalysisComplete}
        multimodalAnalysis={true}
      />
    </div>
  );
}
