
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
  const [hasRelatedInspections, setHasRelatedInspections] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleDelete = async () => {
    if (!checklistId) return;
    
    setIsConfirming(true);
    setErrorMessage(null);
    
    try {
      console.log("Preparing to delete checklist:", checklistId, checklistTitle);
      await deleteChecklist.mutateAsync(checklistId);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in DeleteChecklistDialog:", error);
      
      // Check if the error is due to related inspections
      if (error.code === '23503' && error.message.includes('inspections')) {
        setHasRelatedInspections(true);
        setErrorMessage("Este checklist possui inspeções relacionadas e não pode ser excluído diretamente.");
      } else {
        setErrorMessage(`Erro ao excluir checklist: ${error.message || "Erro desconhecido"}`);
      }
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
            
            {hasRelatedInspections && (
              <div className="mt-2 p-2 bg-red-50 rounded-md text-red-700 text-sm">
                <p>Este checklist possui inspeções relacionadas.</p>
                <p>Para excluí-lo, você precisa primeiro excluir todas as inspeções vinculadas a ele.</p>
              </div>
            )}
            
            {errorMessage && !hasRelatedInspections && (
              <div className="mt-2 p-2 bg-red-50 rounded-md text-red-700 text-sm">
                <p>{errorMessage}</p>
              </div>
            )}
            
            <div className="mt-2">
              Esta ação não pode ser desfeita e também removerá todas as perguntas associadas.
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
            disabled={deleteChecklist.isPending || hasRelatedInspections}
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
