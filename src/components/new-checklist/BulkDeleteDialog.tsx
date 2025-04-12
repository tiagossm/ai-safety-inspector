
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
import { Loader2 } from "lucide-react";

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  isDeleting: boolean;
  onConfirmDelete: () => Promise<void>;
}

export function BulkDeleteDialog({
  isOpen,
  onOpenChange,
  selectedCount,
  isDeleting,
  onConfirmDelete,
}: BulkDeleteDialogProps) {
  const handleConfirmDelete = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    try {
      await onConfirmDelete();
      // O diálogo será fechado pelo componente pai após a conclusão bem-sucedida
    } catch (error) {
      console.error("Erro ao excluir em massa:", error);
      // Mantém o diálogo aberto em caso de erro para permitir nova tentativa
    }
  };

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Impede o fechamento do diálogo durante a exclusão
        if (isDeleting && !open) return;
        onOpenChange(open);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir checklists selecionados</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir {selectedCount}{" "}
            {selectedCount === 1 ? "checklist" : "checklists"}.
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
