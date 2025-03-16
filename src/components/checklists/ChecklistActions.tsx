
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
import { supabase } from "@/integrations/supabase/client";

interface ChecklistActionsProps {
  checklist: Checklist;
  onRefresh?: () => void;
}

export function ChecklistActions({ checklist, onRefresh }: ChecklistActionsProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateChecklist } = useChecklists();

  const handleDuplicate = async () => {
    try {
      setIsLoading(true);
      toast.loading("Duplicando checklist...");
      
      // 1. First duplicate the checklist record
      const { data: newChecklist, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          title: `${checklist.title} (Cópia)`,
          description: checklist.description,
          is_template: checklist.is_template,
          status_checklist: checklist.status_checklist,
          category: checklist.category,
          responsible_id: checklist.responsible_id,
          company_id: checklist.company_id,
          user_id: checklist.user_id
        })
        .select()
        .single();
      
      if (checklistError) {
        throw checklistError;
      }
      
      // 2. Now fetch all items from the original checklist
      const { data: originalItems, error: itemsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", checklist.id);
      
      if (itemsError) {
        throw itemsError;
      }
      
      // 3. Create duplicate items for the new checklist
      if (originalItems && originalItems.length > 0) {
        const newItems = originalItems.map(item => ({
          checklist_id: newChecklist.id,
          pergunta: item.pergunta,
          tipo_resposta: item.tipo_resposta,
          obrigatorio: item.obrigatorio,
          ordem: item.ordem,
          opcoes: item.opcoes,
          permite_foto: item.permite_foto,
          permite_audio: item.permite_audio,
          permite_video: item.permite_video
        }));
        
        const { error: insertError } = await supabase
          .from("checklist_itens")
          .insert(newItems);
        
        if (insertError) {
          throw insertError;
        }
      }
      
      toast.dismiss();
      toast.success("Checklist duplicado com sucesso!");
      
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error("Erro ao duplicar checklist:", error);
      toast.dismiss();
      toast.error("Falha ao duplicar checklist");
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Duplicar</span>
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
