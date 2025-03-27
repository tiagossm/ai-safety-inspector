import React, { useState } from "react";
import { InspectionQuestion } from "./InspectionQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SubChecklistDialog } from "./dialogs/SubChecklistDialog";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuestionsPanelProps {
  loading: boolean;
  currentGroupId: string | null;
  filteredQuestions: any[];
  questions: any[];
  responses: Record<string, any>;
  groups: any[];
  onResponseChange: (questionId: string, data: any) => void;
  onSaveSubChecklistResponses: (questionId: string, responses: Record<string, any>) => Promise<void>;
  subChecklists: Record<string, any>;
}

export function QuestionsPanel({
  loading,
  currentGroupId,
  filteredQuestions,
  questions,
  responses,
  groups,
  onResponseChange,
  onSaveSubChecklistResponses,
  subChecklists
}: QuestionsPanelProps) {
  const [subChecklistDialogOpen, setSubChecklistDialogOpen] = useState(false);
  const [currentSubChecklist, setCurrentSubChecklist] = useState<any>(null);
  const [currentParentQuestionId, setCurrentParentQuestionId] = useState<string | null>(null);
  const [savingSubChecklist, setSavingSubChecklist] = useState(false);
  
  const safeParseResponse = (value: any) => {
    if (!value) return null;
    
    if (typeof value === 'object') return value;
    
    if (typeof value === 'string') {
      try {
        if (value.startsWith('{') || value.startsWith('[')) {
          return JSON.parse(value);
        }
        return value;
      } catch (e) {
        console.warn("Failed to parse JSON response:", e);
        return value;
      }
    }
    
    return value;
  };
  
  const handleOpenSubChecklist = (questionId: string) => {
    if (!subChecklists || !subChecklists[questionId]) {
      toast.error("Sub-checklist não encontrado");
      return;
    }
    
    const subChecklist = subChecklists[questionId];
    const parentResponse = responses[questionId] || {};
    
    let subChecklistResponses: Record<string, any> = {};
    
    if (parentResponse.subChecklistResponses) {
      try {
        if (typeof parentResponse.subChecklistResponses === 'object') {
          subChecklistResponses = parentResponse.subChecklistResponses;
        } else {
          const parsedResponses = safeParseResponse(parentResponse.subChecklistResponses);
          if (parsedResponses && typeof parsedResponses === 'object') {
            subChecklistResponses = parsedResponses;
          }
        }
      } catch (error) {
        console.error("Error parsing sub-checklist responses:", error);
        subChecklistResponses = {};
      }
    }
    
    setCurrentSubChecklist(subChecklist);
    setCurrentParentQuestionId(questionId);
    setSubChecklistDialogOpen(true);
  };
  
  const handleSaveSubChecklistResponses = async (responsesObj: Record<string, any>) => {
    if (!currentParentQuestionId) return;
    
    setSavingSubChecklist(true);
    
    try {
      onResponseChange(currentParentQuestionId, {
        ...(responses[currentParentQuestionId] || {}),
        subChecklistResponses: responsesObj
      });
      
      await onSaveSubChecklistResponses(currentParentQuestionId, responsesObj);
      
      toast.success("Respostas do sub-checklist salvas com sucesso");
      setSubChecklistDialogOpen(false);
    } catch (error) {
      console.error("Error saving sub-checklist responses:", error);
      toast.error("Erro ao salvar respostas do sub-checklist");
    } finally {
      setSavingSubChecklist(false);
    }
  };
  
  const currentGroup = groups.find(g => g.id === currentGroupId);
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando perguntas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentGroupId || !currentGroup) {
    return (
      <Card className="min-h-[300px]">
        <CardContent className="p-8 flex justify-center items-center">
          <p className="text-muted-foreground">Selecione um grupo para ver as perguntas</p>
        </CardContent>
      </Card>
    );
  }
  
  if (filteredQuestions.length === 0) {
    return (
      <Card className="min-h-[300px]">
        <CardHeader>
          <h3 className="text-lg font-semibold">{currentGroup.title}</h3>
        </CardHeader>
        <CardContent className="p-8 flex flex-col justify-center items-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-center">
            Nenhuma pergunta disponível neste grupo.<br />
            {questions.length > 0 ? 
              `Há ${questions.length} perguntas em outros grupos.` : 
              "Nenhuma pergunta foi definida para este checklist."}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{currentGroup.title}</h3>
          <p className="text-sm text-muted-foreground">
            {filteredQuestions.length} {filteredQuestions.length === 1 ? 'pergunta' : 'perguntas'} neste grupo
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {filteredQuestions.map((question, index) => (
            <InspectionQuestion
              key={question.id}
              question={{
                ...question,
                hasSubChecklist: !!subChecklists[question.id]
              }}
              index={index}
              response={responses[question.id] || {}}
              onResponseChange={(data) => onResponseChange(question.id, data)}
              allQuestions={questions}
              onOpenSubChecklist={question.hasSubChecklist ? () => handleOpenSubChecklist(question.id) : undefined}
            />
          ))}
          
          <div className="pt-4 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                toast.info("Próximo grupo será implementado em versões futuras");
              }}
            >
              Próximo Grupo
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {currentSubChecklist && (
        <SubChecklistDialog
          open={subChecklistDialogOpen}
          onOpenChange={setSubChecklistDialogOpen}
          subChecklist={currentSubChecklist}
          subChecklistQuestions={currentSubChecklist.questions || []}
          currentResponses={
            currentParentQuestionId && 
            responses[currentParentQuestionId] && 
            responses[currentParentQuestionId].subChecklistResponses
              ? safeParseResponse(responses[currentParentQuestionId].subChecklistResponses)
              : {}
          }
          onSaveResponses={handleSaveSubChecklistResponses}
          saving={savingSubChecklist}
        />
      )}
    </>
  );
}
