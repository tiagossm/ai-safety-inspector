
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useDeleteChecklist } from "@/hooks/checklist/useDeleteChecklist";

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
  const deleteChecklist = useDeleteChecklist();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteChecklist.mutateAsync(checklistId);
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Checklist</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o checklist <strong>"{checklistTitle}"</strong>? Esta ação é irreversível 
            e todos os dados relacionados a este checklist serão perdidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir Checklist"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
