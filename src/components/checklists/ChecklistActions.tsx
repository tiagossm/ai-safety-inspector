
import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Copy, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DeleteChecklistDialog } from "./DeleteChecklistDialog";
import { useNavigate } from "react-router-dom";
import { useChecklists } from "@/hooks/useChecklists";
import { toast } from "sonner";
import { Checklist } from "@/types/checklist";
import { useDuplicateChecklist } from "@/hooks/checklist/useDuplicateChecklist";

interface ChecklistActionsProps {
  checklist: Checklist;
  onRefresh?: () => void;
}

export function ChecklistActions({ checklist, onRefresh }: ChecklistActionsProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateChecklist } = useChecklists();
  const duplicateChecklistMutation = useDuplicateChecklist();

  const handleDuplicate = async () => {
    try {
      setIsLoading(true);
      console.log("Duplicating checklist:", checklist.id);
      await duplicateChecklistMutation.mutateAsync(checklist.id);
      if (onRefresh) {
        console.log("Refreshing checklist list");
        onRefresh();
      }
    } catch (error) {
      console.error("Erro ao duplicar checklist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/checklists/${checklist.id}`);
  };

  const handleExecute = () => {
    // Implement checklist execution logic here
    toast.info("Funcionalidade de execução de checklist em desenvolvimento");
    // navigate(`/checklists/${checklist.id}/execute`);
  };

  const isProcessing = isLoading || duplicateChecklistMutation.isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer" 
            onClick={handleDuplicate}
            disabled={isProcessing}
          >
            <Copy className="mr-2 h-4 w-4" />
            <span>{isProcessing ? "Duplicando..." : "Duplicar"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleExecute}>
            <Play className="mr-2 h-4 w-4" />
            <span>Executar</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:text-destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteChecklistDialog
        checklistId={checklist.id}
        checklistTitle={checklist.title}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
