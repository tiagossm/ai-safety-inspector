
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface ActionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionText: string;
  actionPlanText: string;
  setActionPlanText: (text: string) => void;
  onSave: () => void;
}

export function ActionPlanDialog({
  open,
  onOpenChange,
  questionText,
  actionPlanText,
  setActionPlanText,
  onSave
}: ActionPlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="action-plan-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Plano de Ação</span>
          </DialogTitle>
          <DialogDescription id="action-plan-description">
            Descreva as ações necessárias para resolver esta não conformidade.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="bg-muted/50 p-2 rounded text-sm">
            <p className="font-medium mb-1 text-xs text-muted-foreground">Não conformidade:</p>
            <p>{questionText}</p>
          </div>
          
          <Textarea
            placeholder="Descreva o plano de ação para corrigir esta não conformidade..."
            value={actionPlanText}
            onChange={(e) => setActionPlanText(e.target.value)}
            rows={5}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>Salvar Plano de Ação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
