
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  XCircle, 
  Camera,
  Mic,
  Video,
  Clock,
  ChevronRight,
  ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubChecklistDialog } from "@/components/inspection/dialogs/SubChecklistDialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface QuestionsPanelProps {
  loading: boolean;
  currentGroupId: string | null;
  filteredQuestions: any[];
  questions: any[];
  responses: Record<string, any>;
  groups: any[];
  onResponseChange: (questionId: string, value: string, notes?: string) => void;
  onSaveSubChecklistResponses?: (
    parentQuestionId: string, 
    responses: Array<{questionId: string, value: string, comment?: string}>
  ) => Promise<boolean>;
  subChecklists?: Record<string, any>;
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
  subChecklists = {}
}: QuestionsPanelProps) {
  const [subChecklistDialogOpen, setSubChecklistDialogOpen] = useState(false);
  const [currentSubChecklist, setCurrentSubChecklist] = useState<{
    parentQuestionId: string;
    subChecklist: any;
    subChecklistQuestions: any[];
    currentResponses: Record<string, any>;
  } | null>(null);
  
  // State to track expanded sub-checklists
  const [expandedSubChecklists, setExpandedSubChecklists] = useState<Record<string, boolean>>({});

  const toggleSubChecklistExpand = (questionId: string) => {
    setExpandedSubChecklists(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleOpenSubChecklist = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.sub_checklist_id) return;
    
    const subChecklist = subChecklists[question.sub_checklist_id];
    if (!subChecklist) {
      console.error("Sub-checklist not found:", question.sub_checklist_id);
      return;
    }
    
    // Parse current responses for this sub-checklist if any
    let currentResponses = {};
    
    if (responses[questionId] && responses[questionId].answer) {
      try {
        const answerData = JSON.parse(responses[questionId].answer);
        if (answerData.type === 'sub-checklist' && answerData.responses) {
          currentResponses = answerData.responses;
        }
      } catch (e) {
        console.error("Error parsing sub-checklist responses:", e);
      }
    }
    
    setCurrentSubChecklist({
      parentQuestionId: questionId,
      subChecklist,
      subChecklistQuestions: subChecklist.questions || [],
      currentResponses
    });
    
    setSubChecklistDialogOpen(true);
  };

  const handleSaveSubChecklistResponses = async (responses: Array<{questionId: string, value: string, comment?: string}>) => {
    if (!currentSubChecklist || !onSaveSubChecklistResponses) return;
    
    const success = await onSaveSubChecklistResponses(
      currentSubChecklist.parentQuestionId,
      responses
    );
    
    if (success) {
      setSubChecklistDialogOpen(false);
      
      // Mark the parent question as answered
      const hasResponses = responses.some(r => r.value);
      if (hasResponses) {
        onResponseChange(
          currentSubChecklist.parentQuestionId, 
          JSON.stringify({
            type: 'sub-checklist',
            answered: true,
            count: responses.length,
            answeredCount: responses.filter(r => r.value).length
          })
        );
      }
    }
  };

  const renderQuestion = (question: any, index: number) => {
    const response = responses[question.id];
    const hasAnswered = response && response.answer;
    
    // Check if this question has a sub-checklist
    const hasSubChecklist = question.sub_checklist_id && subChecklists[question.sub_checklist_id];
    const isSubChecklistExpanded = expandedSubChecklists[question.id];
    
    // Parse sub-checklist responses
    let subChecklistStats = null;
    if (hasAnswered && question.sub_checklist_id) {
      try {
        const answerData = JSON.parse(response.answer);
        if (answerData.type === 'sub-checklist') {
          subChecklistStats = {
            answered: answerData.answered,
            count: answerData.count,
            answeredCount: answerData.answeredCount
          };
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
    
    return (
      <div key={question.id} className="mb-4 border-b pb-4 last:border-b-0 last:pb-0">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-muted-foreground text-sm">{index + 1}.</span>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-sm mb-2 flex-1">{question.pergunta}</h3>
              {question.obrigatorio && (
                <span className="text-red-500 text-xs">*</span>
              )}
            </div>
            
            {/* Options based on question type */}
            {question.tipo_resposta === 'sim/não' && (
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={hasAnswered && response.answer === "sim" ? "default" : "outline"}
                  size="sm"
                  className="gap-1"
                  onClick={() => onResponseChange(question.id, "sim")}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>SIM</span>
                </Button>
                <Button
                  type="button"
                  variant={hasAnswered && response.answer === "não" ? "default" : "outline"}
                  size="sm"
                  className="gap-1"
                  onClick={() => onResponseChange(question.id, "não")}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>NÃO</span>
                </Button>
              </div>
            )}
            
            {question.tipo_resposta === 'texto' && (
              <Textarea
                placeholder="Digite sua resposta..."
                rows={2}
                className="mb-2"
                value={hasAnswered ? response.answer : ""}
                onChange={(e) => onResponseChange(question.id, e.target.value)}
              />
            )}
            
            {question.tipo_resposta === 'seleção múltipla' && question.opcoes && (
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.isArray(question.opcoes) ? (
                  question.opcoes.map((option: string, i: number) => (
                    <Button
                      key={i}
                      type="button"
                      variant={hasAnswered && response.answer === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => onResponseChange(question.id, option)}
                    >
                      {option}
                    </Button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Opções não definidas corretamente</p>
                )}
              </div>
            )}
            
            {/* Sub-checklist UI */}
            {hasSubChecklist && (
              <div className="mt-3 mb-3">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-2"
                    onClick={() => handleOpenSubChecklist(question.id)}
                  >
                    <span>Abrir Sub-Checklist</span>
                    {subChecklistStats && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {subChecklistStats.answeredCount}/{subChecklistStats.count}
                      </span>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleSubChecklistExpand(question.id)}
                  >
                    {isSubChecklistExpanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                </div>
                
                <Collapsible open={isSubChecklistExpanded}>
                  <CollapsibleContent className="mt-2 pl-4 border-l-2 border-l-muted">
                    <div className="text-sm font-medium mb-2">
                      {subChecklists[question.sub_checklist_id]?.title}
                    </div>
                    
                    <div className="space-y-2">
                      {(subChecklists[question.sub_checklist_id]?.questions || []).map((subQ: any, idx: number) => (
                        <div key={subQ.id} className="text-xs bg-muted/30 p-2 rounded-md">
                          <div className="font-medium mb-1">
                            {idx + 1}. {subQ.pergunta || subQ.text}
                          </div>
                          
                          {response && response.answer && (
                            <div className="text-xs text-muted-foreground">
                              {(() => {
                                try {
                                  const parsed = JSON.parse(response.answer);
                                  if (parsed.type === 'sub-checklist' && parsed.responses && parsed.responses[subQ.id]) {
                                    return (
                                      <div>
                                        <span className="font-semibold">Resposta:</span> {parsed.responses[subQ.id].value}
                                        {parsed.responses[subQ.id].comment && (
                                          <div>
                                            <span className="font-semibold">Comentário:</span> {parsed.responses[subQ.id].comment}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                  return "Sem resposta";
                                } catch (e) {
                                  return "Sem resposta";
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
            
            {/* Notes field */}
            <Textarea
              placeholder="Observações..."
              rows={1}
              className="text-xs"
              value={hasAnswered && response.notes ? response.notes : ""}
              onChange={(e) => onResponseChange(question.id, response?.answer || "", e.target.value)}
            />
            
            {/* Media options */}
            <div className="flex gap-2 mt-2">
              {question.permite_foto && (
                <Button type="button" variant="outline" size="sm" className="text-xs gap-1" disabled>
                  <Camera className="h-3.5 w-3.5" />
                  <span>Foto</span>
                </Button>
              )}
              
              {question.permite_video && (
                <Button type="button" variant="outline" size="sm" className="text-xs gap-1" disabled>
                  <Video className="h-3.5 w-3.5" />
                  <span>Vídeo</span>
                </Button>
              )}
              
              {question.permite_audio && (
                <Button type="button" variant="outline" size="sm" className="text-xs gap-1" disabled>
                  <Mic className="h-3.5 w-3.5" />
                  <span>Áudio</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const currentGroup = groups.find(g => g.id === currentGroupId);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>
              {currentGroup ? currentGroup.title : "Perguntas"} 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredQuestions.length} {filteredQuestions.length === 1 ? "item" : "itens"})
              </span>
            </span>
            
            {/* Mobile tabs for group selection */}
            <div className="md:hidden">
              <Tabs defaultValue={currentGroupId || ""}>
                <TabsList className="grid-cols-1">
                  <TabsTrigger value={currentGroupId || ""} className="cursor-default">
                    <Clock className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[120px]">{currentGroup?.title}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground italic">
              Nenhuma pergunta encontrada para este grupo
            </div>
          ) : (
            <>
              {filteredQuestions.map((question, index) => renderQuestion(question, index))}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Sub-checklist Dialog */}
      {currentSubChecklist && (
        <SubChecklistDialog
          open={subChecklistDialogOpen}
          onOpenChange={setSubChecklistDialogOpen}
          subChecklist={currentSubChecklist.subChecklist}
          subChecklistQuestions={currentSubChecklist.subChecklistQuestions}
          currentResponses={currentSubChecklist.currentResponses}
          onSaveResponses={handleSaveSubChecklistResponses}
          readOnly={false}
        />
      )}
    </>
  );
}
