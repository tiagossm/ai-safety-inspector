
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";

interface SubChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subChecklist: any;
  subChecklistQuestions: any[];
}

export function SubChecklistDialog({
  open,
  onOpenChange,
  subChecklist,
  subChecklistQuestions,
}: SubChecklistDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                      <h3 className="font-medium mb-2 text-sm">{subQ.text}</h3>
                      
                      {subQ.responseType === "sim/não" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>SIM</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>NÃO</span>
                          </Button>
                        </div>
                      )}
                      
                      {subQ.responseType === "texto" && (
                        <Textarea 
                          placeholder="Digite sua resposta..."
                          rows={2}
                          className="text-sm"
                        />
                      )}
                      
                      {(subQ.responseType === "seleção múltipla" || subQ.responseType === "multiple_choice") && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {subQ.options?.map((option: string, i: number) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="text-xs"
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
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
