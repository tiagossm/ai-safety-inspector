
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteChecklistDialog({
  checklistId,
  checklistTitle,
  isOpen,
  onOpenChange,
  onDeleted,
  isDeleting
}: DeleteChecklistDialogProps) {
  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    try {
      await onDeleted();
      // O diálogo será fechado pelo componente pai após a conclusão bem-sucedida
    } catch (error) {
      console.error("Erro ao excluir checklist:", error);
      // Mantém o diálogo aberto em caso de erro para permitir nova tentativa
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      // Impede o fechamento do diálogo durante a exclusão
      if (isDeleting && !open) return;
      onOpenChange(open);
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir checklist</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Deseja realmente excluir o checklist 
            <span className="font-semibold"> {checklistTitle}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button 
            variant="outline" 
            onClick={() => !isDeleting && onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Sim, excluir"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
