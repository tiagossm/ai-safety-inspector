
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  MessageCircle,
  Camera,
  Info,
  List,
  CornerDownRight,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

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
    toast.success("Comment saved");
  };
  
  const handleSaveActionPlan = () => {
    onResponseChange({
      ...(response || {}),
      actionPlan: actionPlanText
    });
    setActionPlanDialogOpen(false);
    toast.success("Action plan saved");
  };
  
  const loadSubChecklist = async () => {
    if (!question.subChecklistId) return;
    
    setLoadingSubChecklist(true);
    try {
      // Fetch sub-checklist
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", question.subChecklistId)
        .single();
        
      if (checklistError) throw checklistError;
      
      setSubChecklist(checklistData);
      
      // Fetch questions
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
      toast.error("Failed to load sub-checklist");
    } finally {
      setLoadingSubChecklist(false);
    }
  };
  
  const renderYesNoOptions = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          variant={response?.value === "sim" ? "default" : "outline"}
          className={`flex items-center gap-2 ${response?.value === "sim" ? "bg-green-500 hover:bg-green-600" : ""}`}
          onClick={() => handleResponseValue("sim")}
          size="sm"
        >
          <CheckCircle className="h-4 w-4" />
          <span>YES</span>
        </Button>
        <Button
          variant={response?.value === "não" ? "default" : "outline"}
          className={`flex items-center gap-2 ${response?.value === "não" ? "bg-red-500 hover:bg-red-600" : ""}`}
          onClick={() => handleResponseValue("não")}
          size="sm"
        >
          <XCircle className="h-4 w-4" />
          <span>NO</span>
        </Button>
        <Button
          variant={response?.value === "n/a" ? "default" : "outline"}
          className={`flex items-center gap-2 ${response?.value === "n/a" ? "bg-gray-500 hover:bg-gray-600" : ""}`}
          onClick={() => handleResponseValue("n/a")}
          size="sm"
        >
          <HelpCircle className="h-4 w-4" />
          <span>N/A</span>
        </Button>
      </div>
    );
  };
  
  const renderTextInput = () => {
    return (
      <div className="mt-2">
        <Textarea
          value={response?.value || ""}
          onChange={(e) => handleResponseValue(e.target.value)}
          placeholder="Type your answer..."
          rows={2}
        />
      </div>
    );
  };
  
  const renderNumberInput = () => {
    return (
      <div className="mt-2">
        <Input
          type="number"
          value={response?.value || ""}
          onChange={(e) => handleResponseValue(e.target.value)}
          placeholder="Enter a numeric value..."
        />
      </div>
    );
  };
  
  const renderMultipleChoiceOptions = () => {
    if (!question.options || question.options.length === 0) {
      return <p className="text-sm text-muted-foreground mt-2">No options available</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {question.options.map((option: string, i: number) => (
          <Button
            key={i}
            variant={response?.value === option ? "default" : "outline"}
            onClick={() => handleResponseValue(option)}
            size="sm"
          >
            {option}
          </Button>
        ))}
      </div>
    );
  };
  
  const renderResponseInput = () => {
    // Convert from Portuguese to English types
    const responseType = question.responseType;
    
    if (responseType === "sim/não") {
      return renderYesNoOptions();
    } else if (responseType === "numérico") {
      return renderNumberInput();
    } else if (responseType === "texto" || responseType === "text") {
      return renderTextInput();
    } else if (responseType === "seleção múltipla" || responseType === "multiple_choice") {
      return renderMultipleChoiceOptions();
    } else if (responseType === "foto" || responseType === "photo") {
      return (
        <div className="mt-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            size="sm"
          >
            <Camera className="h-4 w-4" />
            <span>Take Photo</span>
          </Button>
        </div>
      );
    } else {
      return <p className="text-sm text-muted-foreground mt-2">Unsupported response type: {responseType}</p>;
    }
  };
  
  // Determine if this question is a follow-up question (has a parent)
  const isFollowUpQuestion = !!question.parentQuestionId;
  const parentQuestion = isFollowUpQuestion ? 
    allQuestions.find(q => q.id === question.parentQuestionId) : null;
  
  // Determine if this question should be shown based on parent's answer
  const shouldShow = !isFollowUpQuestion || 
    (parentQuestion && response && 
     response.value === question.conditionValue);
  
  if (!shouldShow) return null;
  
  // Determine card styling based on response or requirement
  const getCardClasses = () => {
    let baseClasses = "overflow-hidden border";
    
    if (!response?.value && question.isRequired) {
      return `${baseClasses} border-l-4 border-l-yellow-500`;
    }
    
    if (question.responseType === "sim/não") {
      if (response?.value === "sim") return `${baseClasses} border-l-4 border-l-green-500`;
      if (response?.value === "não") return `${baseClasses} border-l-4 border-l-red-500`;
      return baseClasses;
    }
    
    if (response?.value) {
      return `${baseClasses} border-l-4 border-l-blue-500`;
    }
    
    return baseClasses;
  };
  
  return (
    <>
      <Card className={getCardClasses()}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              {isFollowUpQuestion && (
                <CornerDownRight className="h-4 w-4 mt-1 text-muted-foreground" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{index + 1}.</span>
                  <h3 className="font-medium">{question.text}</h3>
                  {question.isRequired && (
                    <Badge variant="outline" className="text-red-500">*</Badge>
                  )}
                </div>
                
                {renderResponseInput()}
                
                {response?.comment && !showCommentSection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCommentSection(true)}
                    className="mt-2 flex items-center gap-1 text-xs"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>Show Comment</span>
                  </Button>
                )}
                
                {(showCommentSection || response?.comment) && (
                  <div className="mt-2 bg-slate-50 p-2 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-700">Comment:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCommentSection(false)}
                        className="h-5 w-5 p-0"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">{response?.comment || "No comment added yet."}</p>
                  </div>
                )}
                
                {question.hasSubChecklist && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadSubChecklist}
                      disabled={loadingSubChecklist}
                      className="flex items-center gap-1"
                    >
                      <List className="h-4 w-4" />
                      <span>{loadingSubChecklist ? "Loading..." : "Open Sub-Checklist"}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {question.hint && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 mt-0"
                title="Question hint"
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {(response?.value === "não" || isActionPlanOpen || response?.actionPlan) && (
            <Collapsible
              open={isActionPlanOpen || !!response?.actionPlan}
              onOpenChange={setIsActionPlanOpen}
              className="mt-3"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 w-full justify-start bg-amber-50 border-amber-200 text-amber-800"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>{response?.actionPlan ? "Action Plan" : "Add Action Plan"}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <h4 className="text-sm font-medium text-amber-800">Action Plan</h4>
                  </div>
                  <Textarea
                    value={response?.actionPlan || ""}
                    onChange={(e) => {
                      onResponseChange({
                        ...(response || {}),
                        actionPlan: e.target.value
                      });
                    }}
                    placeholder="Describe the action plan to address this issue..."
                    rows={2}
                    className="bg-white"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCommentText(response?.comment || "");
                setCommentDialogOpen(true);
              }}
              className="flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (response?.value === "não") {
                  setActionPlanText(response?.actionPlan || "");
                  setActionPlanDialogOpen(true);
                } else {
                  toast.info("Action plans are typically added for 'No' responses");
                  setIsActionPlanOpen(true);
                }
              }}
              className="flex items-center gap-1"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Action Plan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1">Question:</Label>
              <p className="text-sm">{question.text}</p>
            </div>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your comment here..."
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCommentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveComment}>
                Save Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Action Plan Dialog */}
      <Dialog open={actionPlanDialogOpen} onOpenChange={setActionPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Action Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1">Non-Compliance:</Label>
              <p className="text-sm">{question.text}</p>
            </div>
            <Textarea
              value={actionPlanText}
              onChange={(e) => setActionPlanText(e.target.value)}
              placeholder="Describe the required actions to address this issue..."
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setActionPlanDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveActionPlan}>
                Save Action Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Sub-Checklist Dialog */}
      <Dialog open={subChecklistDialogOpen} onOpenChange={setSubChecklistDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{subChecklist?.title || "Sub-Checklist"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1">
            {subChecklist?.description && (
              <p className="text-muted-foreground mb-4">{subChecklist.description}</p>
            )}
            
            <div className="space-y-4">
              {subChecklistQuestions.map((subQ, idx) => (
                <Card key={subQ.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">{idx + 1}.</span>
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{subQ.text}</h3>
                        
                        {subQ.responseType === "sim/não" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>YES</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>NO</span>
                            </Button>
                          </div>
                        )}
                        
                        {subQ.responseType === "texto" && (
                          <Textarea 
                            placeholder="Type your answer..."
                            rows={2}
                          />
                        )}
                        
                        {(subQ.responseType === "seleção múltipla" || subQ.responseType === "multiple_choice") && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {subQ.options?.map((option: string, i: number) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setSubChecklistDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Simple Label component for the dialog content
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className || ""}`}>
      {children}
    </label>
  );
}
