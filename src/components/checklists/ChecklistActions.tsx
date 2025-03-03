
import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DeleteChecklistDialog } from "./DeleteChecklistDialog";
import { useUpdateChecklist } from "@/hooks/checklist/useUpdateChecklist";
import { toast } from "sonner";
import { Checklist } from "@/types/checklist";

interface ChecklistActionsProps {
  checklist: Checklist;
}

export function ChecklistActions({ checklist }: ChecklistActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const updateChecklist = useUpdateChecklist();

  const handleDuplicate = async () => {
    try {
      toast.loading("Duplicando checklist...");
      const newTitle = `${checklist.title} (Cópia)`;
      
      await updateChecklist.mutateAsync({
        id: checklist.id,
        data: {
          title: newTitle,
        },
      });
      
      toast.dismiss();
      toast.success("Checklist duplicado com sucesso!");
    } catch (error) {
      toast.dismiss();
      console.error("Erro ao duplicar checklist:", error);
      toast.error("Falha ao duplicar checklist");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Duplicar</span>
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
