
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Save } from "lucide-react";
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
  onSaveResponses?: (responses: SubChecklistResponse[]) => void;
  readOnly?: boolean;
}

export function SubChecklistDialog({
  open,
  onOpenChange,
  subChecklist,
  subChecklistQuestions,
  currentResponses = {},
  onSaveResponses,
  readOnly = false
}: SubChecklistDialogProps) {
  const [responses, setResponses] = useState<Record<string, SubChecklistResponse>>(
    Object.keys(currentResponses).reduce((acc, key) => {
      acc[key] = {
        questionId: key,
        value: currentResponses[key].value || '',
        comment: currentResponses[key].comment || ''
      };
      return acc;
    }, {})
  );

  const [saving, setSaving] = useState(false);

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
    
    setSaving(true);
    try {
      const responsesArray = Object.values(responses);
      onSaveResponses(responsesArray);
      toast.success("Sub-checklist salvo com sucesso");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar sub-checklist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{subChecklist?.title || "Sub-Checklist"}</DialogTitle>
          {readOnly && (
            <Badge variant="outline" className="ml-2">Somente leitura</Badge>
          )}
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
                      <h3 className="font-medium mb-2 text-sm">{subQ.text}</h3>
                      
                      {(subQ.responseType === "sim/não" || subQ.responseType === "yes_no") && (
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
                      
                      {(subQ.responseType === "texto" || subQ.responseType === "text") && (
                        <Textarea 
                          placeholder="Digite sua resposta..."
                          rows={2}
                          className="text-sm"
                          value={responses[subQ.id]?.value || ''}
                          onChange={(e) => handleValueChange(subQ.id, e.target.value)}
                          disabled={readOnly}
                        />
                      )}
                      
                      {(subQ.responseType === "seleção múltipla" || subQ.responseType === "multiple_choice") && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {subQ.options?.map((option: string, i: number) => (
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
              disabled={saving}
              className="mr-2"
            >
              {saving ? "Salvando..." : "Salvar Respostas"}
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
