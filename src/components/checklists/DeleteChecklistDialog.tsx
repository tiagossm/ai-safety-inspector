
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteChecklist } from "@/hooks/checklist/useDeleteChecklist";
import { toast } from "@/components/ui/use-toast";

interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteChecklistDialog({
  checklistId,
  checklistTitle,
  isOpen,
  onOpenChange,
}: DeleteChecklistDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteChecklistMutation = useDeleteChecklist();

  const handleDelete = async () => {
    if (!checklistId) return;
    
    setIsDeleting(true);
    try {
      await deleteChecklistMutation.mutateAsync(checklistId);
      toast.success("Checklist excluído com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao excluir checklist:", error);
      toast.error("Erro ao excluir checklist. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Checklist</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o checklist <strong>{checklistTitle}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
