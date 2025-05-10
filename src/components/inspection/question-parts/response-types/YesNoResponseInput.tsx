
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Upload, PenLine, AlertCircle, Sparkles, Search } from "lucide-react";
import { ActionPlanFormData } from "@/components/action-plans/form/types";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";
import { ActionPlanDialog } from "@/components/action-plans/ActionPlanDialog";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";

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
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, MediaAnalysisResult>>(
    response?.mediaAnalysisResults || {}
  );
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  
  // Update internal state when response changes
  useEffect(() => {
    if (response?.mediaAnalysisResults) {
      console.log("YesNoResponseInput: Updating media analysis results from response:", response.mediaAnalysisResults);
      setMediaAnalysisResults(response.mediaAnalysisResults);
    }
  }, [response?.mediaAnalysisResults]);
  
  // Find first AI suggestion from media analysis
  useEffect(() => {
    const suggestion = Object.values(mediaAnalysisResults).find(result => 
      result?.actionPlanSuggestion
    )?.actionPlanSuggestion || null;
    
    console.log("YesNoResponseInput: Found AI suggestion:", suggestion);
    setAiSuggestion(suggestion);
  }, [mediaAnalysisResults]);
  
  const handleRadioChange = (value: boolean) => {
    console.log("YesNoResponseInput: Radio changed to:", value);
    if (readOnly) return;
    
    // Ensure we don't lose any existing data in the response
    const updatedResponse = { 
      ...response,
      value 
    };
    
    console.log("YesNoResponseInput: Sending updated response:", updatedResponse);
    onResponseChange(updatedResponse);
  };
  
  const handleMediaAnalysisResult = (url: string, result: MediaAnalysisResult) => {
    console.log("YesNoResponseInput: Media analysis result for URL:", url, result);
    const updatedMediaAnalysisResults = {
      ...mediaAnalysisResults,
      [url]: result
    };
    
    setMediaAnalysisResults(updatedMediaAnalysisResults);
    
    // Update the response with analysis results
    const updatedResponse = {
      ...response,
      mediaAnalysisResults: updatedMediaAnalysisResults
    };
    
    console.log("YesNoResponseInput: Updating response with analysis results:", updatedResponse);
    onResponseChange(updatedResponse);
    
    // If there's a non-conformity, show a toast notification
    if (result.hasNonConformity) {
      toast.info("IA detectou possível não conformidade", {
        description: "Foi sugerido um plano de ação.",
        duration: 5000
      });
    }
    
    // Update AI suggestion
    if (result.actionPlanSuggestion) {
      setAiSuggestion(result.actionPlanSuggestion);
    }
  };
  
  // Check if we have non-conformity results in any media analysis
  const hasNonConformityInAnalysis = Object.values(mediaAnalysisResults).some(result => 
    result.hasNonConformity
  );
  
  // Handle applying AI suggestion to action plan
  const handleApplyAISuggestion = () => {
    console.log("YesNoResponseInput: Applying AI suggestion:", aiSuggestion);
    if (onApplyAISuggestion && aiSuggestion) {
      onApplyAISuggestion(aiSuggestion);
      toast.success("Sugestão da IA aplicada", {
        description: "O plano de ação foi preenchido com a sugestão da IA",
      });
    }
  };
  
  // Handle opening the multimodal analysis dialog
  const handleOpenAnalysisDialog = () => {
    setShowAnalysisDialog(true);
  };
  
  // Handle analysis dialog result
  const handleFullAnalysisComplete = (result: MediaAnalysisResult) => {
    console.log("YesNoResponseInput: Full analysis complete:", result);
    
    if (result.actionPlanSuggestion) {
      setAiSuggestion(result.actionPlanSuggestion);
      
      // Show toast notification
      toast.info("Análise multimodal concluída", {
        description: "Uma sugestão de plano de ação está disponível.",
        duration: 5000
      });
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
          className={`min-w-[80px] ${response?.value === true ? "bg-green-500 hover:bg-green-600" : ""}`}
          type="button"
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          <span>Sim</span>
        </Button>
        
        <Button
          variant={response?.value === false ? "default" : "outline"}
          onClick={() => handleRadioChange(false)}
          disabled={readOnly}
          className={`min-w-[80px] ${response?.value === false ? "bg-red-500 hover:bg-red-600" : ""}`}
          type="button"
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          <span>Não</span>
        </Button>
        
        {/* Status badges */}
        {response?.value === true && (
          <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1" variant="outline">
            <ThumbsUp className="h-3 w-3" />
            <span>OK</span>
          </Badge>
        )}
        
        {response?.value === false && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1" variant="outline">
            <AlertCircle className="h-3 w-3" />
            <span>Necessita de Plano de Ação</span>
          </Badge>
        )}
      </div>
      
      {/* Analyze with AI button - always visible */}
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
      
      {/* Media upload section */}
      {(question.allowsPhoto || question.permite_foto || 
        question.allowsVideo || question.permite_video || 
        question.allowsAudio || question.permite_audio || 
        question.allowsFiles || question.permite_files) && (
        <div className="mt-4">
          <MediaUploadInput
            mediaUrls={response?.mediaUrls || []}
            onMediaChange={(urls) => {
              console.log("YesNoResponseInput: Media URLs changed:", urls);
              if (onMediaChange) onMediaChange(urls);
              
              // Also update the response directly to ensure changes are saved
              onResponseChange({
                ...response,
                mediaUrls: urls
              });
            }}
            readOnly={readOnly}
            questionText={questionText}
            onSaveAnalysis={handleMediaAnalysisResult}
            onApplyAISuggestion={onApplyAISuggestion}
            analysisResults={mediaAnalysisResults}
            allowsPhoto={question.allowsPhoto || question.permite_foto}
            allowsVideo={question.allowsVideo || question.permite_video}
            allowsAudio={question.allowsAudio || question.permite_audio}
            allowsFiles={question.allowsFiles || question.permite_files}
          />
        </div>
      )}
      
      {/* AI Suggestion for Action Plan */}
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
      
      {/* Action plan dialog */}
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
      
      {/* Full analysis dialog for multimodal analysis */}
      <MediaAnalysisDialog
        open={showAnalysisDialog}
        onOpenChange={setShowAnalysisDialog}
        mediaUrl={null} // We'll pass null since we're doing a full context analysis
        questionText={questionText}
        responseValue={response?.value}
        mediaUrls={response?.mediaUrls || []}
        onAnalysisComplete={handleFullAnalysisComplete}
        multimodalAnalysis={true}
      />
      
      {/* Show action plan button for negative responses */}
      {response?.value === false && inspectionId && question.id && onSaveActionPlan && !readOnly && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActionPlanDialog(true)}
            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            type="button"
          >
            {actionPlan ? (
              <>
                <PenLine className="h-3.5 w-3.5 mr-1" />
                Editar plano de ação
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                {aiSuggestion ? "Criar plano de ação (IA)" : "Adicionar plano de ação"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
