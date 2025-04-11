
import React from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => Promise<void> | void;
  isDeleting?: boolean; // Make this prop optional
}

export function DeleteChecklistDialog({
  checklistId,
  checklistTitle,
  isOpen,
  onOpenChange,
  onDeleted,
  isDeleting: externalIsDeleting,
}: DeleteChecklistDialogProps) {
  const [internalIsDeleting, setInternalIsDeleting] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isDeleting = externalIsDeleting !== undefined ? externalIsDeleting : internalIsDeleting;

  const handleDelete = async () => {
    if (!checklistId) {
      toast.error("ID do checklist não fornecido");
      onOpenChange(false);
      return;
    }
    
    setInternalIsDeleting(true);
    try {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);
      
      if (error) throw error;
      
      // Close dialog before calling onDeleted
      onOpenChange(false);
      
      // Call callback after successful deletion
      if (onDeleted) await onDeleted();
      
      toast.success("Checklist excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir checklist:", error);
      toast.error("Erro ao excluir checklist");
    } finally {
      setInternalIsDeleting(false);
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
