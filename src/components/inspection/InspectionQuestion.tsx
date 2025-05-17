
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuestionHeader } from "./question-parts/QuestionHeader";
import { ResponseInput } from "./question-parts/ResponseInput";
import { CommentsSection } from "./question-parts/CommentsSection";
import { ActionPlanSection } from "./question-parts/ActionPlanSection";
import { MediaUploadSection } from "./question-inputs/MediaUploadSection";
import { ActionPlan } from '@/services/inspection/actionPlanService';
import { ActionPlanFormData } from '@/components/action-plans/form/types';
import { useMediaAnalysis, MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { ActionPlanImplementation } from "./ActionPlanImplementation";
import { ActionPlanDialog } from "@/components/action-plans/ActionPlanDialog"; // Importe o componente de diálogo

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  allQuestions?: any[];
  numberLabel?: string; 
  inspectionId?: string;
  isSubQuestion?: boolean;
  actionPlan?: ActionPlan;
  onSaveActionPlan?: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
  onOpenSubChecklist?: () => void;
}

export function InspectionQuestion({
  question,
  index,
  response,
  onResponseChange,
  allQuestions = [],
  numberLabel = "",
  inspectionId,
  isSubQuestion = false,
  actionPlan,
  onSaveActionPlan,
  onOpenSubChecklist
}: InspectionQuestionProps) {
  const [showComments, setShowComments] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [showActionPlanImplementation, setShowActionPlanImplementation] = useState(false);
  const [showActionPlanDialog, setShowActionPlanDialog] = useState(false); // Novo estado para controlar o diálogo
  const [loadingSubChecklist, setLoadingSubChecklist] = useState(false);
  const [multiModalLoading, setMultiModalLoading] = useState(false);
  
  // Track media analysis results
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, MediaAnalysisResult>>({});
  
  // Get the analyze function
  const { analyze, analyzing } = useMediaAnalysis();

  const handleCommentChange = (comment: string) => {
    onResponseChange({
      ...response,
      comment
    });
  };

  const handleActionPlanChange = (actionPlan: string) => {
    onResponseChange({
      ...response,
      actionPlan
    });
  };

  const handleResponseValueChange = (value: any) => {
    // If the response has changed to negative, show the action plan section
    if (isNegativeResponse(value)) {
      setShowActionPlan(true);
    }
    
    onResponseChange({
      ...response,
      value
    });
  };

  const handleMediaChange = (mediaUrls: string[]) => {
    console.log("[InspectionQuestion] handleMediaChange:", question.id, mediaUrls);
    onResponseChange({
      ...response,
      mediaUrls,
    });
  };

  const isNegativeResponse = (value: any): boolean => {
    // Check if this is a negative response based on the question type
    if (question.responseType === 'yes_no') {
      return value === false || value === 'no' || value === 'não';
    }
    
    // For other question types, they might have custom "negative" values
    return false;
  };

  const handleSaveAnalysis = (url: string, result: MediaAnalysisResult) => {
    console.log("Saving analysis for URL:", url, result);
    
    setMediaAnalysisResults(prev => ({
      ...prev,
      [url]: result
    }));
    
    // If it's a non-conformity and action plan section isn't shown yet, show it
    if (result.hasNonConformity) {
      setShowActionPlan(true);
      
      // Se houver uma sugestão de plano de ação, aplique-a automaticamente se não houver plano existente
      if (result.actionPlanSuggestion && (!response.actionPlan || response.actionPlan === "")) {
        handleActionPlanChange(result.actionPlanSuggestion);
      }
    }
  };

  const handleApplyAISuggestion = (suggestion: string) => {
    if (!suggestion) return;
    
    handleActionPlanChange(suggestion);
  };

  // Handle multi-modal analysis of all media for the question
  const handleAnalyzeAllMedia = async () => {
    // Only proceed if we have media URLs
    if (!response.mediaUrls || response.mediaUrls.length <= 1) {
      console.log("Pelo menos 2 imagens são necessárias para análise em conjunto");
      return;
    }
    
    try {
      setMultiModalLoading(true);
      
      const result = await analyze({
        mediaUrl: response.mediaUrls[0], // Use the first URL as the primary
        questionText: question.text,
        multimodalAnalysis: true,
        additionalMediaUrls: response.mediaUrls.slice(1) // Add the rest as additional
      });
      
      // If the analysis was successful, save it for each media URL
      if (result) {
        const updatedResults = {...mediaAnalysisResults};
        
        // Apply the relevant parts of the multimodal analysis to each media URL
        response.mediaUrls.forEach((url: string) => {
          updatedResults[url] = {
            ...result,
            questionText: question.text,
            hasNonConformity: result.hasNonConformity,
            psychosocialRiskDetected: result.psychosocialRiskDetected,
            actionPlanSuggestion: result.actionPlanSuggestion
          };
        });
        
        setMediaAnalysisResults(updatedResults);
        
        // If it's a non-conformity and action plan section isn't shown yet, show it
        if (result.hasNonConformity) {
          setShowActionPlan(true);
          
          // Se houver uma sugestão de plano de ação, aplique-a automaticamente se não houver plano existente
          if (result.actionPlanSuggestion && (!response.actionPlan || response.actionPlan === "")) {
            handleActionPlanChange(result.actionPlanSuggestion);
          }
        }
      }
    } catch (error) {
      console.error("Error in multi-modal analysis:", error);
    } finally {
      setMultiModalLoading(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleOpenActionPlanDialog = () => {
    // Abrir o diálogo de plano de ação estruturado
    setShowActionPlanDialog(true); // Abre o diálogo de plano de ação
  };

  const handleOpenSubChecklist = () => {
    if (onOpenSubChecklist) {
      setLoadingSubChecklist(true);
      try {
        onOpenSubChecklist();
      } finally {
        setLoadingSubChecklist(false);
      }
    }
  };

  // Extract AI suggestions from media analysis results
  const getAISuggestions = (): string[] => {
    const suggestions: string[] = [];
    
    Object.values(mediaAnalysisResults).forEach(result => {
      if (result?.actionPlanSuggestion && !suggestions.includes(result.actionPlanSuggestion)) {
        suggestions.push(result.actionPlanSuggestion);
      }
    });
    
    return suggestions;
  };
  
  // Função para salvar o plano de ação estruturado
  const handleSaveStructuredActionPlan = async (data: ActionPlanFormData) => {
    if (onSaveActionPlan) {
      const result = await onSaveActionPlan(data);
      
      // Após salvar o plano de ação estruturado, exibir o componente de implementação
      if (result) {
        setShowActionPlanImplementation(true);
        setShowActionPlanDialog(false); // Fechar o diálogo após salvar
      }
      
      return result;
    }
  };

  // Se a resposta é negativa, mostrar o plano de ação mesmo que não tenha explicitamente definido showActionPlan
  useEffect(() => {
    if (response && isNegativeResponse(response.value)) {
      setShowActionPlan(true);
    }
    
    // Se há um plano de ação existente, também mostrar a seção de plano de ação
    if (response && response.actionPlan) {
      setShowActionPlan(true);
    }
    
    // Se já existe um plano de ação estruturado para esta questão, mostrar a implementação
    if (actionPlan && inspectionId && question.id) {
      setShowActionPlanImplementation(true);
    }
  }, [response, actionPlan, inspectionId, question.id]);

  // Extrair a melhor sugestão de plano de ação das análises de IA
  const getBestAISuggestion = (): string | undefined => {
    const suggestions = Object.values(mediaAnalysisResults)
      .map(result => result?.actionPlanSuggestion)
      .filter(Boolean);
    
    return suggestions.length > 0 ? suggestions[0] : undefined;
  };

  return (
    <Card className={isSubQuestion ? "border-gray-200 bg-gray-50" : ""}>
      <CardHeader className="py-3 px-4">
        <QuestionHeader 
          question={question} 
          index={index}
          numberLabel={numberLabel}
          showComments={showComments}
          onToggleComments={handleToggleComments}
          hasSubChecklist={question.hasSubChecklist}
          loadingSubChecklist={loadingSubChecklist}
          onOpenSubChecklist={handleOpenSubChecklist}
        />
      </CardHeader>
      <CardContent className="py-3 px-4">
        <ResponseInput
          question={question}
          value={response?.value}
          onChange={handleResponseValueChange}
        />
        
        {showComments && (
          <CommentsSection
            comment={response?.comment || ""}
            onCommentChange={handleCommentChange}
          />
        )}
        
        {response?.mediaUrls && response.mediaUrls.length > 0 && (
          <div className="mt-4">
            <MediaUploadSection
              mediaUrls={response.mediaUrls || []}
              onMediaChange={handleMediaChange}
              questionId={question.id}
              inspectionId={inspectionId}
              isReadOnly={false}
              questionText={question.text}
              onSaveAnalysis={handleSaveAnalysis}
              onApplyAISuggestion={handleApplyAISuggestion}
              analysisResults={mediaAnalysisResults}
              onAnalyzeAll={handleAnalyzeAllMedia}
              multiModalLoading={multiModalLoading}
            />
          </div>
        )}
        
        {/* Mostrar seção de plano de ação simples quando não está mostrando a implementação */}
        {(isNegativeResponse(response?.value) || showActionPlan || response?.actionPlan) && !showActionPlanImplementation && (
          <ActionPlanSection
            isOpen={showActionPlan}
            onOpenChange={setShowActionPlan}
            actionPlan={response?.actionPlan || ""}
            onActionPlanChange={handleActionPlanChange}
            onOpenDialog={inspectionId && question.id ? handleOpenActionPlanDialog : undefined}
            hasNegativeResponse={isNegativeResponse(response?.value)}
            aiSuggestion={getBestAISuggestion()}
            mediaAnalysisResults={mediaAnalysisResults}
          />
        )}

        {/* Structured Action Plan Dialog */}
        {inspectionId && question.id && onSaveActionPlan && (
          <ActionPlanDialog
            open={showActionPlanDialog}
            onOpenChange={setShowActionPlanDialog}
            inspectionId={inspectionId}
            questionId={question.id}
            existingPlan={actionPlan}
            onSave={handleSaveStructuredActionPlan}
            aiSuggestion={getBestAISuggestion()}
          />
        )}

        {/* Structured Action Plan Implementation Component */}
        {showActionPlanImplementation && inspectionId && question.id && onSaveActionPlan && (
          <div className="mt-4 pt-4 border-t border-dashed">
            <ActionPlanImplementation
              inspectionId={inspectionId}
              questionId={question.id}
              questionText={question.text || ""}
              actionPlans={actionPlan ? [actionPlan] : []}
              loading={false}
              onSaveActionPlan={onSaveActionPlan}
              aiSuggestions={getAISuggestions()}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
