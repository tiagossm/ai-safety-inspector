
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash, Loader2 } from "lucide-react";

interface DeleteInspectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  inspectionTitle?: string;
  loading?: boolean;
  trigger?: React.ReactNode;
  isMultiple?: boolean;
  selectedCount?: number;
}

export function DeleteInspectionDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  inspectionTitle,
  loading = false,
  trigger,
  isMultiple = false,
  selectedCount = 0
}: DeleteInspectionDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  // Determine title and description based on selection mode
  const dialogTitle = isMultiple 
    ? `Excluir ${selectedCount} ${selectedCount === 1 ? 'inspeção' : 'inspeções'}`
    : "Confirmar exclusão";

  const dialogDescription = isMultiple
    ? `Você tem certeza que deseja excluir ${selectedCount} ${selectedCount === 1 ? 'inspeção selecionada' : 'inspeções selecionadas'}? Esta ação não pode ser desfeita.`
    : `Você tem certeza que deseja excluir a inspeção ${inspectionTitle ? `"${inspectionTitle}"` : "selecionada"}? Esta ação não pode ser desfeita.`;

  const confirmButtonText = isMultiple
    ? `Excluir ${selectedCount} ${selectedCount === 1 ? 'inspeção' : 'inspeções'}`
    : "Excluir";

  const loadingText = isMultiple
    ? "Excluindo inspeções..."
    : "Excluindo...";

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      // Prevent dialog from closing during deletion
      if (loading && !open) return;
      onOpenChange(open);
    }}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {dialogDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingText}
              </>
            ) : (
              confirmButtonText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
