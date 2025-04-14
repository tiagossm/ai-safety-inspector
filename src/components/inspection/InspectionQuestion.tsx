
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ResponseInputRenderer } from "./question-parts/ResponseInputRenderer";
import { Textarea } from "@/components/ui/textarea";
import { ActionPlanSection } from "./question-inputs/ActionPlanSection";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Pencil, List } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  allQuestions: any[];
  numberLabel?: string;
  isSubQuestion?: boolean;
  onOpenSubChecklist?: () => void;
}

export const InspectionQuestion = React.memo(function InspectionQuestion({
  question,
  index,
  response,
  onResponseChange,
  allQuestions,
  numberLabel,
  isSubQuestion = false,
  onOpenSubChecklist
}: InspectionQuestionProps) {
  const [comment, setComment] = useState(response?.comment || "");
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [isValid, setIsValid] = useState(!question.isRequired);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  
  const normalizedType = useMemo(() => {
    const type = question.responseType || question.tipo_resposta || "";
    if (typeof type !== 'string') return 'unknown';
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('sim/não') || lowerType.includes('yes_no') || lowerType.includes('yes/no')) {
      return 'yes_no';
    } else if (lowerType.includes('múltipla') || lowerType.includes('multiple')) {
      return 'multiple_choice';
    } else if (lowerType.includes('texto') || lowerType.includes('text')) {
      return 'text';
    } else if (lowerType.includes('numeric') || lowerType.includes('numérico')) {
      return 'numeric';
    } else if (lowerType.includes('foto') || lowerType.includes('photo')) {
      return 'photo';
    } else {
      return lowerType;
    }
  }, [question.responseType, question.tipo_resposta]);
  
  const questionText = question.text || question.pergunta || "";
  const isRequired = question.isRequired !== undefined ? question.isRequired : question.obrigatorio;
  const hasSubChecklist = question.hasSubChecklist || false;
  
  const allowsPhoto = question.allowsPhoto || question.permite_foto || false;
  const allowsVideo = question.allowsVideo || question.permite_video || false;
  const allowsAudio = question.allowsAudio || question.permite_audio || false;
  
  // Reduzir chamadas ao console em produção
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Question ${question.id} media capabilities:`, { 
        allowsPhoto, 
        allowsVideo, 
        allowsAudio,
        responseType: normalizedType
      });
    }
  }, [question.id, allowsPhoto, allowsVideo, allowsAudio, normalizedType]);
  
  const handleValueChange = useCallback((value: any) => {
    setIsValid(!isRequired || (value !== undefined && value !== null && value !== ""));
    
    onResponseChange({
      ...response,
      value,
      comment
    });
  }, [isRequired, response, comment, onResponseChange]);
  
  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    
    onResponseChange({
      ...response,
      comment: e.target.value
    });
  }, [response, onResponseChange]);
  
  const handleActionPlanChange = useCallback((actionPlan: string) => {
    onResponseChange({
      ...response,
      actionPlan
    });
  }, [response, onResponseChange]);
  
  const handleAddMedia = useCallback(() => {
    console.log("Attempting to add media to question:", question.id);
    
    const mediaUrls = response.mediaUrls || [];
    const mockMediaUrl = `https://placehold.co/300x200?text=Media+${mediaUrls.length + 1}`;
    
    onResponseChange({
      ...response,
      mediaUrls: [...mediaUrls, mockMediaUrl]
    });
  }, [question.id, response, onResponseChange]);
  
  const shouldBeVisible = useCallback(() => {
    if (!question.parentQuestionId && !question.parent_item_id) {
      return true;
    }
    
    const parentId = question.parentQuestionId || question.parent_item_id;
    const parentQuestion = allQuestions.find(q => q.id === parentId);
    
    if (!parentQuestion) {
      return true;
    }
    
    return true;
  }, [question.parentQuestionId, question.parent_item_id, allQuestions]);
  
  if (!shouldBeVisible()) {
    return null;
  }
  
  // Calculate if response is negative (for action plan visibility)
  const hasNegativeResponse = 
    response?.value === false || 
    response?.value === "false" || 
    response?.value === "não" || 
    response?.value === "nao" || 
    response?.value === "no";
  
  return (
    <div className={`relative ${!isValid && response.value !== undefined ? 'border-l-4 border-l-red-500 pl-2' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="font-medium min-w-[24px] mt-0.5">{numberLabel || (index + 1)}</div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-medium flex-1">{questionText}</div>
            
            {hasSubChecklist && onOpenSubChecklist && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSubChecklist}
                className="flex items-center"
              >
                <List className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Ver sub-checklist</span>
              </Button>
            )}
          </div>
          
          <div className="mt-2">
            <ResponseInputRenderer
              question={question}
              response={response}
              onResponseChange={handleValueChange}
              onAddMedia={handleAddMedia}
            />
          </div>
          
          {(allowsPhoto || allowsVideo || allowsAudio) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {allowsPhoto && (
                <Button size="sm" variant="outline" onClick={handleAddMedia}>
                  Adicionar Foto
                </Button>
              )}
              {allowsVideo && (
                <Button size="sm" variant="outline" onClick={handleAddMedia}>
                  Adicionar Vídeo
                </Button>
              )}
              {allowsAudio && (
                <Button size="sm" variant="outline" onClick={handleAddMedia}>
                  Adicionar Áudio
                </Button>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <Collapsible open={isCommentOpen} onOpenChange={setIsCommentOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center text-xs gap-1">
                  <Pencil className="h-3 w-3" />
                  Adicionar comentário
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-2">
                  <Textarea
                    placeholder="Adicione seus comentários aqui..."
                    value={comment}
                    onChange={handleCommentChange}
                    className="text-sm"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsActionPlanOpen(!isActionPlanOpen)}
              className="flex items-center text-xs"
            >
              {isActionPlanOpen ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
              Plano de ação
            </Button>
          </div>
          
          <ActionPlanSection
            isOpen={isActionPlanOpen}
            onOpenChange={setIsActionPlanOpen}
            actionPlan={response?.actionPlan}
            onActionPlanChange={handleActionPlanChange}
            onOpenDialog={() => {}} // Implement if needed
            hasNegativeResponse={hasNegativeResponse}
          />
        </div>
      </div>
    </div>
  );
});
