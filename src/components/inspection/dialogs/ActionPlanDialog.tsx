
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  onSave,
}: ActionPlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Plano de Ação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1">Não-Conformidade:</Label>
            <p className="text-sm">{questionText}</p>
          </div>
          <Textarea
            value={actionPlanText}
            onChange={(e) => setActionPlanText(e.target.value)}
            placeholder="Descreva as ações necessárias para resolver este problema..."
            rows={5}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={onSave}>
              Salvar Plano de Ação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
