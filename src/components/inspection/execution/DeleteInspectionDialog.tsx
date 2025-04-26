
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: string;
  inspectionTitle: string;
  onDeleted: () => void;
}

export function DeleteInspectionDialog({
  open,
  onOpenChange,
  inspectionId,
  inspectionTitle,
  onDeleted
}: DeleteInspectionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!inspectionId) {
      toast.error("ID da inspeção não fornecido");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // In a real implementation, this would make an API call to delete the inspection
      // For now, we'll simulate a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Inspeção excluída com sucesso");
      onDeleted();
    } catch (error) {
      console.error("Error deleting inspection:", error);
      toast.error("Erro ao excluir inspeção");
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-destructive">
            <Trash2 className="h-5 w-5 mr-2" />
            Excluir Inspeção
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a inspeção <strong>{inspectionTitle}</strong>?
            <br />
            <br />
            Esta ação não poderá ser desfeita e todos os dados associados serão permanentemente excluídos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
