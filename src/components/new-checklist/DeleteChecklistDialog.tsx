
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
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteChecklistDialog({
  checklistId,
  checklistTitle,
  isOpen,
  onOpenChange,
  onDeleted
}: DeleteChecklistDialogProps) {
  const deleteChecklist = useChecklistDelete();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDelete = async () => {
    if (!checklistId) {
      toast.error("ID do checklist não fornecido");
      onOpenChange(false);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteChecklist.mutateAsync(checklistId);
      
      // Check if we're on the details page of the checklist being deleted
      const isOnDetailsPage = location.pathname.includes(`/new-checklists/${checklistId}`);
      
      // Close the dialog before navigating
      onOpenChange(false);
      
      // If we're on the details page of the deleted checklist, navigate to the checklists page
      if (isOnDetailsPage) {
        console.log("Navegando para a lista de checklists após exclusão");
        navigate("/new-checklists", { replace: true });
      }
      
      // Call the onDeleted callback if provided
      if (onDeleted) {
        await onDeleted();
      }
      
      // Success message is shown by the mutation
    } catch (error) {
      console.error("Erro ao excluir checklist:", error);
      toast.error("Erro ao excluir checklist");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Checklist</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o checklist "{checklistTitle}"?
            <br />
            Esta ação não pode ser desfeita e todos os itens associados serão removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
