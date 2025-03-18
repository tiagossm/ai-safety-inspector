
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
import { useDeleteChecklist } from "@/hooks/checklist/useDeleteChecklist";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
      const isOnDetailsPage = location.pathname.includes(`/checklists/${checklistId}`);
      
      // Close the dialog before navigating
      onOpenChange(false);
      
      // If we're on the details page of the deleted checklist, navigate to the checklists page
      if (isOnDetailsPage) {
        console.log("Navegando para a lista de checklists após exclusão");
        navigate("/checklists", { replace: true });
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
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
