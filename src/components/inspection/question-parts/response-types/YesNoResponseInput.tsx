
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Upload, PenLine, AlertCircle } from "lucide-react";
import { ActionPlanFormData } from "@/components/action-plans/form/types";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";
import { ActionPlanDialog } from "@/components/action-plans/ActionPlanDialog";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, MediaAnalysisResult>>(
    response?.mediaAnalysisResults || {}
  );
  
  // Update internal state when response changes
  useEffect(() => {
    if (response?.mediaAnalysisResults) {
      setMediaAnalysisResults(response.mediaAnalysisResults);
    }
  }, [response?.mediaAnalysisResults]);
  
  const handleRadioChange = (value: boolean) => {
    if (readOnly) return;
    // Ensure we don't lose any existing data in the response
    onResponseChange({ 
      ...response,
      value 
    });
  };
  
  const handleMediaAnalysisResult = (url: string, result: MediaAnalysisResult) => {
    const updatedMediaAnalysisResults = {
      ...mediaAnalysisResults,
      [url]: result
    };
    
    setMediaAnalysisResults(updatedMediaAnalysisResults);
    
    // Update the response with analysis results
    onResponseChange({
      ...response,
      mediaAnalysisResults: updatedMediaAnalysisResults
    });
    
    // If there's a non-conformity, show a toast notification
    if (result.hasNonConformity) {
      toast.info("IA detectou possível não conformidade", {
        description: "Foi sugerido um plano de ação.",
        duration: 5000
      });
    }
  };
  
  // Check if we have non-conformity results in any media analysis
  const hasNonConformityInAnalysis = Object.values(mediaAnalysisResults).some(result => 
    result.hasNonConformity
  );
  
  // Get the first available action plan suggestion
  const firstSuggestion = Object.values(mediaAnalysisResults).find(result => 
    result.actionPlanSuggestion
  )?.actionPlanSuggestion;
  
  // Handle applying AI suggestion to action plan
  const handleApplyAISuggestion = (suggestion: string) => {
    if (onApplyAISuggestion) {
      onApplyAISuggestion(suggestion);
    }
  };
  
  const questionText = question.text || question.pergunta || "";
  
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant={response?.value === true ? "default" : "outline"}
          onClick={() => handleRadioChange(true)}
          disabled={readOnly}
          className="min-w-[80px]"
        >
          <ThumbsUp className={`h-4 w-4 ${response?.value === true ? "mr-2" : ""}`} />
          {response?.value === true && "Sim"}
        </Button>
        
        <Button
          variant={response?.value === false ? "default" : "outline"}
          onClick={() => handleRadioChange(false)}
          disabled={readOnly}
          className="min-w-[80px]"
        >
          <ThumbsDown className={`h-4 w-4 ${response?.value === false ? "mr-2" : ""}`} />
          {response?.value === false && "Não"}
        </Button>
        
        {/* Show AI analysis indicator if we have non-conformity in media analysis */}
        {hasNonConformityInAnalysis && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1" variant="outline">
            <AlertCircle className="h-3 w-3" />
            <span>IA detectou não conformidade</span>
          </Badge>
        )}
      </div>
      
      {/* Media upload section */}
      {(question.allowsPhoto || question.permite_foto || 
        question.allowsVideo || question.permite_video || 
        question.allowsAudio || question.permite_audio || 
        question.allowsFiles || question.permite_files) && (
        <div className="mt-4">
          <MediaUploadInput
            mediaUrls={response?.mediaUrls || []}
            onMediaChange={onMediaChange}
            readOnly={readOnly}
            questionText={questionText}
            onSaveAnalysis={handleMediaAnalysisResult}
            onApplyAISuggestion={handleApplyAISuggestion}
            analysisResults={mediaAnalysisResults}
            allowsPhoto={question.allowsPhoto || question.permite_foto}
            allowsVideo={question.allowsVideo || question.permite_video}
            allowsAudio={question.allowsAudio || question.permite_audio}
            allowsFiles={question.allowsFiles || question.permite_files}
          />
        </div>
      )}
      
      {/* Action plan dialog */}
      {inspectionId && question.id && onSaveActionPlan && (
        <ActionPlanDialog
          open={showActionPlanDialog}
          onOpenChange={setShowActionPlanDialog}
          inspectionId={inspectionId}
          questionId={question.id}
          existingPlan={actionPlan}
          onSave={onSaveActionPlan}
          aiSuggestion={firstSuggestion}
        />
      )}
      
      {/* Show action plan button for negative responses */}
      {response?.value === false && inspectionId && question.id && onSaveActionPlan && !readOnly && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActionPlanDialog(true)}
            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
          >
            {actionPlan ? (
              <>
                <PenLine className="h-3.5 w-3.5 mr-1" />
                Editar plano de ação
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Adicionar plano de ação
                {firstSuggestion && " (IA sugeriu ações)"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
