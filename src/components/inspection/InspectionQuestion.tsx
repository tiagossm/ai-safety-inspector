
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Info,
  List,
  CornerDownRight,
  AlertTriangle,
  MessageCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Import utility functions
import { getAllowedAttachmentTypes, shouldShowQuestion, getQuestionCardClasses } from "./utils/questionUtils";

// Import dialogs
import { CommentDialog } from "./dialogs/CommentDialog";
import { ActionPlanDialog } from "./dialogs/ActionPlanDialog";
import { MediaDialog } from "./dialogs/MediaDialog";
import { SubChecklistDialog } from "./dialogs/SubChecklistDialog";

// Import question inputs
import { YesNoInput } from "./question-inputs/YesNoInput";
import { TextInput } from "./question-inputs/TextInput";
import { NumberInput } from "./question-inputs/NumberInput";
import { MultipleChoiceInput } from "./question-inputs/MultipleChoiceInput";
import { PhotoInput } from "./question-inputs/PhotoInput";
import { MediaAttachments } from "./question-inputs/MediaAttachments";
import { ActionPlanSection } from "./question-inputs/ActionPlanSection";

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  allQuestions: any[];
}

export function InspectionQuestion({
  question,
  index,
  response,
  onResponseChange,
  allQuestions
}: InspectionQuestionProps) {
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [actionPlanDialogOpen, setActionPlanDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [subChecklistDialogOpen, setSubChecklistDialogOpen] = useState(false);
  const [subChecklist, setSubChecklist] = useState<any>(null);
  const [subChecklistQuestions, setSubChecklistQuestions] = useState<any[]>([]);
  const [loadingSubChecklist, setLoadingSubChecklist] = useState(false);
  const [commentText, setCommentText] = useState(response?.comment || "");
  const [actionPlanText, setActionPlanText] = useState(response?.actionPlan || "");
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  
  const handleResponseValue = (value: any) => {
    onResponseChange({
      ...(response || {}),
      value
    });
  };
  
  const handleSaveComment = () => {
    onResponseChange({
      ...(response || {}),
      comment: commentText
    });
    setCommentDialogOpen(false);
    toast.success("Comentário salvo");
  };
  
  const handleSaveActionPlan = () => {
    onResponseChange({
      ...(response || {}),
      actionPlan: actionPlanText
    });
    setActionPlanDialogOpen(false);
    toast.success("Plano de ação salvo");
  };
  
  const handleMediaUploaded = (mediaData: any) => {
    const mediaUrls = response?.mediaUrls || [];
    
    onResponseChange({
      ...(response || {}),
      mediaUrls: [...mediaUrls, mediaData.url]
    });
    
    toast.success("Mídia adicionada com sucesso");
    setMediaDialogOpen(false);
  };
  
  const loadSubChecklist = async () => {
    if (!question.subChecklistId) return;
    
    setLoadingSubChecklist(true);
    try {
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", question.subChecklistId)
        .single();
        
      if (checklistError) throw checklistError;
      
      setSubChecklist(checklistData);
      
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", question.subChecklistId)
        .order("ordem", { ascending: true });
        
      if (questionsError) throw questionsError;
      
      setSubChecklistQuestions(questionsData.map((q: any) => ({
        id: q.id,
        text: q.pergunta,
        responseType: q.tipo_resposta,
        isRequired: q.obrigatorio,
        options: Array.isArray(q.opcoes) ? q.opcoes.map((opt: any) => String(opt)) : [],
        order: q.ordem
      })));
      
      setSubChecklistDialogOpen(true);
    } catch (error) {
      console.error("Error loading sub-checklist:", error);
      toast.error("Falha ao carregar sub-checklist");
    } finally {
      setLoadingSubChecklist(false);
    }
  };
  
  const renderResponseInput = () => {
    const responseType = question.responseType;
    
    if (responseType === "sim/não" || responseType === "yes_no") {
      return <YesNoInput value={response?.value} onChange={handleResponseValue} />;
    } else if (responseType === "numérico" || responseType === "numeric") {
      return <NumberInput value={response?.value} onChange={handleResponseValue} />;
    } else if (responseType === "texto" || responseType === "text") {
      return <TextInput value={response?.value} onChange={handleResponseValue} />;
    } else if (responseType === "seleção múltipla" || responseType === "multiple_choice") {
      return <MultipleChoiceInput options={question.options || []} value={response?.value} onChange={handleResponseValue} />;
    } else if (responseType === "foto" || responseType === "photo") {
      return <PhotoInput onAddMedia={() => setMediaDialogOpen(true)} mediaUrls={response?.mediaUrls} />;
    } else {
      return <p className="text-sm text-muted-foreground mt-2">Tipo de resposta não suportado: {responseType}</p>;
    }
  };
  
  // Check if the question should be shown based on parent conditions
  if (!shouldShowQuestion(question, allQuestions, allQuestions.reduce((acc, q) => {
    if (acc[q.id]) return acc;
    return { ...acc, [q.id]: { value: response?.value } };
  }, {}))) return null;
  
  const isFollowUpQuestion = !!question.parentQuestionId;
  
  return (
    <>
      <Card className={getQuestionCardClasses(question, response)}>
        <CardContent className="p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              {isFollowUpQuestion && (
                <CornerDownRight className="h-3.5 w-3.5 mt-1 text-gray-400" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-medium text-sm text-gray-600">{index + 1}.</span>
                  <h3 className="font-medium text-sm text-gray-800">{question.text}</h3>
                  {question.isRequired && (
                    <Badge variant="outline" className="text-red-500 text-xs h-4 ml-1">*</Badge>
                  )}
                </div>
                
                {renderResponseInput()}
                
                {response?.comment && !showCommentSection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCommentSection(true)}
                    className="mt-1.5 flex items-center gap-1 text-xs h-7 text-gray-500"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>Mostrar Comentário</span>
                  </Button>
                )}
                
                {(showCommentSection || response?.comment) && (
                  <div className="mt-1.5 bg-slate-50 p-2 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-600">Comentário:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCommentSection(false)}
                        className="h-5 w-5 p-0"
                      >
                        <XCircle className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">{response?.comment || "Nenhum comentário adicionado ainda."}</p>
                  </div>
                )}
                
                {question.hasSubChecklist && (
                  <div className="mt-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadSubChecklist}
                      disabled={loadingSubChecklist}
                      className="flex items-center gap-1.5 text-xs h-7"
                    >
                      <List className="h-3.5 w-3.5 text-gray-500" />
                      <span>{loadingSubChecklist ? "Carregando..." : "Abrir Sub-Checklist"}</span>
                    </Button>
                  </div>
                )}
                
                <MediaAttachments mediaUrls={response?.mediaUrls} />
              </div>
            </div>
            
            {question.hint && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 mt-0"
                title="Dica da pergunta"
              >
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            )}
          </div>
          
          {(response?.value === "não" || isActionPlanOpen || response?.actionPlan) && (
            <ActionPlanSection
              isOpen={isActionPlanOpen}
              onOpenChange={setIsActionPlanOpen}
              actionPlan={response?.actionPlan}
              onActionPlanChange={(text) => {
                onResponseChange({
                  ...(response || {}),
                  actionPlan: text
                });
              }}
              onOpenDialog={() => {
                setActionPlanText(response?.actionPlan || "");
                setActionPlanDialogOpen(true);
              }}
              hasNegativeResponse={response?.value === "não"}
            />
          )}
          
          <div className="flex flex-wrap justify-end gap-1.5 mt-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMediaDialogOpen(true)}
              className="flex items-center gap-1 text-xs h-7"
            >
              <Camera className="h-3.5 w-3.5 text-gray-500" />
              <span>Mídia</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCommentText(response?.comment || "");
                setCommentDialogOpen(true);
              }}
              className="flex items-center gap-1 text-xs h-7"
            >
              <MessageCircle className="h-3.5 w-3.5 text-gray-500" />
              <span>Comentário</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (response?.value === "não") {
                  setActionPlanText(response?.actionPlan || "");
                  setActionPlanDialogOpen(true);
                } else {
                  toast.info("Planos de ação são tipicamente adicionados para respostas 'Não'");
                  setIsActionPlanOpen(true);
                }
              }}
              className="flex items-center gap-1 text-xs h-7"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-gray-500" />
              <span>Plano de Ação</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <CommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        questionText={question.text}
        commentText={commentText}
        setCommentText={setCommentText}
        onSave={handleSaveComment}
      />
      
      <ActionPlanDialog
        open={actionPlanDialogOpen}
        onOpenChange={setActionPlanDialogOpen}
        questionText={question.text}
        actionPlanText={actionPlanText}
        setActionPlanText={setActionPlanText}
        onSave={handleSaveActionPlan}
      />
      
      <MediaDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onMediaUploaded={handleMediaUploaded}
        response={response}
        allowedTypes={getAllowedAttachmentTypes(question)}
      />
      
      <SubChecklistDialog
        open={subChecklistDialogOpen}
        onOpenChange={setSubChecklistDialogOpen}
        subChecklist={subChecklist}
        subChecklistQuestions={subChecklistQuestions}
      />
    </>
  );
}
