
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Save, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SubChecklistResponse {
  questionId: string;
  value: string;
  comment?: string;
}

interface SubChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subChecklist: any;
  subChecklistQuestions: any[];
  currentResponses?: Record<string, any>;
  onSaveResponses?: (responses: Record<string, SubChecklistResponse>) => void;
  readOnly?: boolean;
  saving?: boolean;
}

export function SubChecklistDialog({
  open,
  onOpenChange,
  subChecklist,
  subChecklistQuestions,
  currentResponses = {},
  onSaveResponses,
  readOnly = false,
  saving = false
}: SubChecklistDialogProps) {
  const [responses, setResponses] = useState<Record<string, SubChecklistResponse>>({});
  const [localSaving, setSavingLocal] = useState(false);
  // Use the prop value or local state
  const isSaving = saving || localSaving;
  
  // Initialize responses from currentResponses when the dialog opens or when currentResponses changes
  useEffect(() => {
    if (open && currentResponses) {
      try {
        // If currentResponses is a string, try to parse it
        if (typeof currentResponses === 'string') {
          try {
            const parsed = JSON.parse(currentResponses);
            setResponses(parsed);
          } catch (e) {
            console.warn("Failed to parse responses string:", e);
            setResponses({});
          }
        } else {
          // If it's already an object, use it directly
          setResponses(Object.keys(currentResponses).reduce((acc, key) => {
            acc[key] = {
              questionId: key,
              value: currentResponses[key].value || '',
              comment: currentResponses[key].comment || ''
            };
            return acc;
          }, {} as Record<string, SubChecklistResponse>));
        }
      } catch (error) {
        console.error("Error setting responses:", error);
        setResponses({});
      }
    }
  }, [open, currentResponses]);
  
  // Log for debugging
  useEffect(() => {
    if (open) {
      console.log("SubChecklistDialog opened with:", { 
        subChecklist,
        questionsCount: subChecklistQuestions.length,
        currentResponses
      });
    }
  }, [open, subChecklist, subChecklistQuestions, currentResponses]);

  const handleValueChange = (questionId: string, value: string) => {
    if (readOnly) return;
    
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { questionId }),
        value
      }
    }));
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    if (readOnly) return;
    
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { questionId, value: '' }),
        comment
      }
    }));
  };

  const handleSave = () => {
    if (!onSaveResponses) return;
    
    setSavingLocal(true);
    try {
      // Log what we're sending
      console.log("Saving sub-checklist responses:", responses);
      
      // Call the save function with the responses object
      onSaveResponses(responses);
      toast.success("Sub-checklist salvo com sucesso");
      
      // Close dialog after successful save
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving sub-checklist responses:", error);
      toast.error("Erro ao salvar respostas do sub-checklist");
    } finally {
      setSavingLocal(false);
    }
  };

  // Check if there are any questions to display
  if (subChecklistQuestions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-yellow-500 h-5 w-5" />
              Sub-Checklist Vazio
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground">Este sub-checklist não possui perguntas.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]" aria-describedby="subChecklist-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {subChecklist?.title || "Sub-Checklist"}
            {readOnly && (
              <Badge variant="outline" className="ml-2">Somente leitura</Badge>
            )}
          </DialogTitle>
          <DialogDescription id="subChecklist-description">
            {subChecklist?.description || "Lista de verificação secundária com questões adicionais."}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto p-1 max-h-[calc(90vh-10rem)]">
          <div className="space-y-4">
            {subChecklistQuestions.map((subQ, idx) => (
              <Card key={subQ.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <span className="font-medium">{idx + 1}.</span>
                    <div className="flex-1">
                      <h3 className="font-medium mb-2 text-sm">{subQ.pergunta || subQ.text}</h3>
                      
                      {(subQ.tipo_resposta === "sim/não" || subQ.responseType === "yes_no") && (
                        <div className="flex gap-2">
                          <Button
                            variant={responses[subQ.id]?.value === "sim" ? "default" : "outline"}
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                            onClick={() => handleValueChange(subQ.id, "sim")}
                            disabled={readOnly}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>SIM</span>
                          </Button>
                          <Button
                            variant={responses[subQ.id]?.value === "não" ? "default" : "outline"}
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                            onClick={() => handleValueChange(subQ.id, "não")}
                            disabled={readOnly}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>NÃO</span>
                          </Button>
                        </div>
                      )}
                      
                      {(subQ.tipo_resposta === "texto" || subQ.responseType === "text") && (
                        <Textarea 
                          placeholder="Digite sua resposta..."
                          rows={2}
                          className="text-sm"
                          value={responses[subQ.id]?.value || ''}
                          onChange={(e) => handleValueChange(subQ.id, e.target.value)}
                          disabled={readOnly}
                        />
                      )}
                      
                      {(subQ.tipo_resposta === "seleção múltipla" || subQ.responseType === "multiple_choice") && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(subQ.opcoes || subQ.options || []).map((option: string, i: number) => (
                            <Button
                              key={i}
                              variant={responses[subQ.id]?.value === option ? "default" : "outline"}
                              size="sm"
                              className="text-xs"
                              onClick={() => handleValueChange(subQ.id, option)}
                              disabled={readOnly}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <Textarea
                          placeholder="Comentário (opcional)"
                          rows={1}
                          className="text-xs"
                          value={responses[subQ.id]?.comment || ''}
                          onChange={(e) => handleCommentChange(subQ.id, e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <DialogFooter>
          {!readOnly && onSaveResponses && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="mr-2"
            >
              {isSaving ? "Salvando..." : "Salvar Respostas"}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
