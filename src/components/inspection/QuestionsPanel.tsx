
import React, { useState } from "react";
import { InspectionQuestion } from "./InspectionQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SubChecklistDialog } from "./dialogs/SubChecklistDialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface QuestionsPanelProps {
  loading: boolean;
  currentGroupId: string | null;
  filteredQuestions: any[];
  questions: any[];
  responses: Record<string, any>;
  groups: any[];
  onResponseChange: (questionId: string, data: any) => void;
  onSaveSubChecklistResponses: (questionId: string, responses: any[]) => void;
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
  
  // Function to safely parse response data
  const safeParseResponse = (value: any) => {
    if (!value) return null;
    
    if (typeof value === 'object') return value;
    
    // Try to parse JSON if it's a string
    if (typeof value === 'string') {
      try {
        // Only try to parse if it looks like JSON
        if (value.startsWith('{') || value.startsWith('[')) {
          return JSON.parse(value);
        }
        // For simple string values like "sim", "não", just return as is
        return value;
      } catch (e) {
        // If it fails to parse, just return the original string
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
    
    // Process sub-checklist responses
    let subChecklistResponses: Record<string, any> = {};
    
    if (parentResponse.subChecklistResponses) {
      try {
        // Check if it's already an object
        if (typeof parentResponse.subChecklistResponses === 'object') {
          subChecklistResponses = parentResponse.subChecklistResponses;
        } else {
          // Try to parse it safely
          const parsedResponses = safeParseResponse(parentResponse.subChecklistResponses);
          if (parsedResponses && typeof parsedResponses === 'object') {
            subChecklistResponses = parsedResponses;
          }
        }
      } catch (error) {
        console.error("Error parsing sub-checklist responses:", error);
        // Initialize a new object if parsing fails
        subChecklistResponses = {};
      }
    }
    
    setCurrentSubChecklist(subChecklist);
    setCurrentParentQuestionId(questionId);
    setSubChecklistDialogOpen(true);
  };
  
  const handleSaveSubChecklistResponses = (responses: any[]) => {
    if (!currentParentQuestionId) return;
    
    setSavingSubChecklist(true);
    
    try {
      // Convert responses array to object indexed by questionId
      const responsesObj = responses.reduce((acc, curr) => {
        acc[curr.questionId] = curr;
        return acc;
      }, {});
      
      // Update parent response with sub-checklist responses
      onResponseChange(currentParentQuestionId, {
        ...(responses[currentParentQuestionId] || {}),
        subChecklistResponses: responsesObj
      });
      
      // Save to backend
      onSaveSubChecklistResponses(currentParentQuestionId, responses);
      
      toast.success("Respostas do sub-checklist salvas com sucesso");
      setSubChecklistDialogOpen(false);
    } catch (error) {
      console.error("Error saving sub-checklist responses:", error);
      toast.error("Erro ao salvar respostas do sub-checklist");
    } finally {
      setSavingSubChecklist(false);
    }
  };
  
  // Get current group
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
        <CardContent className="p-8 flex justify-center items-center">
          <p className="text-muted-foreground">Nenhuma pergunta disponível neste grupo</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{currentGroup.title}</h3>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {filteredQuestions.map((question, index) => (
            <InspectionQuestion
              key={question.id}
              question={{
                ...question,
                // Add hasSubChecklist flag if this question has a sub-checklist
                hasSubChecklist: !!subChecklists[question.id]
              }}
              index={index}
              response={responses[question.id] || {}}
              onResponseChange={(data) => onResponseChange(question.id, data)}
              allQuestions={questions}
            />
          ))}
          
          <div className="pt-4 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                // Scroll to next group (in future version)
                // For now, just show a placeholder message
                toast.info("Próximo grupo será implementado em versões futuras");
              }}
            >
              Próximo Grupo
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Sub-checklist dialog */}
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
        />
      )}
    </>
  );
}
