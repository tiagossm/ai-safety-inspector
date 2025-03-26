
import React, { useState } from "react";
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
import { useChecklistDelete } from "@/hooks/new-checklist/useChecklistDelete";
import { Loader2 } from "lucide-react";

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
  onOpenChange
}: DeleteChecklistDialogProps) {
  const deleteChecklist = useChecklistDelete();
  const [isConfirming, setIsConfirming] = useState(false);
  
  const handleDelete = async () => {
    setIsConfirming(true);
    try {
      await deleteChecklist.mutateAsync(checklistId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error in DeleteChecklistDialog:", error);
    } finally {
      setIsConfirming(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir checklist</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o checklist <strong>"{checklistTitle}"</strong>?
            <br />
            {deleteChecklist.isPending && isConfirming && (
              <div className="mt-2 p-2 bg-yellow-50 rounded-md text-amber-700 text-sm">
                <p>Excluindo checklist e dados relacionados...</p>
                <p>Isto pode levar alguns instantes se houver inspeções vinculadas a este checklist.</p>
              </div>
            )}
            <div className="mt-2">
              Esta ação não pode ser desfeita e também removerá todas as inspeções associadas.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteChecklist.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteChecklist.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteChecklist.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Sim, excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
