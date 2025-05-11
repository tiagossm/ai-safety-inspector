
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Search, PenLine, AlertCircle, Sparkles } from "lucide-react";
import { ActionPlanFormData } from "@/components/action-plans/form/types";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";
import { ActionPlanDialog } from "@/components/action-plans/ActionPlanDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
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
    
    // Create a new response object with updated value
    const updatedResponse = {
      ...(response || {}),
      value,
      // Preserve existing mediaUrls and analysis results
      mediaUrls: response?.mediaUrls || []
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
      mediaUrls: urls
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
      value: response?.value
    });
  };

  const questionText = question.text || question.pergunta || "";

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant={response?.value === true ? "default" : "outline"}
          onClick={() => handleRadioChange(true)}
          disabled={readOnly}
          className={response?.value === true ? "bg-green-500 hover:bg-green-600 text-white" : ""}
          type="button"
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          <span>Sim</span>
        </Button>

        <Button
          variant={response?.value === false ? "default" : "outline"}
          onClick={() => handleRadioChange(false)}
          disabled={readOnly}
          className={response?.value === false ? "bg-red-500 hover:bg-red-600 text-white" : ""}
          type="button"
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          <span>Não</span>
        </Button>

        {response?.value === true && (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">OK</Badge>
        )}

        {response?.value === false && (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Necessita de Plano de Ação</Badge>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenAnalysisDialog}
        className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        type="button"
      >
        <Search className="h-3.5 w-3.5 mr-1" />
        Analisar com IA
      </Button>

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
            value: response?.value
          });
        }}
        analysisResults={response?.mediaAnalysisResults}
        onApplyAISuggestion={onApplyAISuggestion}
        allowsPhoto={question.allowsPhoto || question.permite_foto}
        allowsVideo={question.allowsVideo || question.permite_video}
        allowsAudio={question.allowsAudio || question.permite_audio}
        allowsFiles={question.allowsFiles || question.permite_files}
      />

      {aiSuggestion && response?.value === false && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center mb-2">
            <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">Sugestão da IA</span>
          </div>
          <p className="text-sm mb-3 text-amber-800">{aiSuggestion}</p>
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-amber-100 hover:bg-amber-200 border-amber-300"
            onClick={handleApplyAISuggestion}
            type="button"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Aplicar esta sugestão
          </Button>
        </div>
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
        responseValue={response?.value}
        mediaUrls={response?.mediaUrls || []}
        onAnalysisComplete={handleFullAnalysisComplete}
        multimodalAnalysis={true}
      />
    </div>
  );
}
