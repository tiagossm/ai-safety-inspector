
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { SubchecklistForm } from "../subchecklist/SubchecklistForm";
import { AlertCircle } from "lucide-react";

interface SubChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subChecklist: any;
  subChecklistQuestions: any[];
  currentResponses: Record<string, any>;
  onSaveResponses: (responses: Record<string, any>) => Promise<void>;
  saving: boolean;
}

export function SubChecklistDialog({
  open,
  onOpenChange,
  subChecklist,
  subChecklistQuestions,
  currentResponses,
  onSaveResponses,
  saving
}: SubChecklistDialogProps) {
  const descriptionId = "subchecklist-dialog-description";
  
  if (!subChecklist) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby={descriptionId}
      >
        <DialogHeader>
          <DialogTitle>
            {subChecklist.title || "Sub-checklist"}
          </DialogTitle>
          <DialogDescription id={descriptionId}>
            {subChecklist.description || "Responda as perguntas deste sub-checklist"}
          </DialogDescription>
        </DialogHeader>

        {subChecklistQuestions && subChecklistQuestions.length > 0 ? (
          <SubchecklistForm
            questions={subChecklistQuestions}
            responses={currentResponses}
            onSave={onSaveResponses}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhuma pergunta encontrada para este sub-checklist</p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Fechar
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={async () => {
              await onSaveResponses(currentResponses);
              onOpenChange(false);
            }}
          >
            {saving ? <Loading size="sm" /> : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
