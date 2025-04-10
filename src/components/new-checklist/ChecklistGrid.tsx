
import React, { useState } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistCard } from "./ChecklistCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import { FileText } from "lucide-react";

interface ChecklistGridProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function ChecklistGrid({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkDelete
}: ChecklistGridProps) {
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedChecklists([...selectedChecklists, id]);
    } else {
      setSelectedChecklists(selectedChecklists.filter(checklistId => checklistId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedChecklists.length === 0) return;
    
    setIsDeleting(true);
    try {
      await onBulkDelete(selectedChecklists);
      toast.success(`${selectedChecklists.length} checklists excluídos com sucesso`);
      setSelectedChecklists([]);
    } catch (error) {
      toast.error("Erro ao excluir checklists selecionados");
      console.error("Error deleting checklists:", error);
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="border border-slate-200 rounded-xl p-4 h-40 animate-pulse bg-gray-50"></div>
        ))}
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl border-dashed">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground mb-6">
          Não foram encontrados checklists com os filtros atuais.
        </p>
      </div>
    );
  }

  return (
    <>
      {selectedChecklists.length > 0 && (
        <div className="sticky top-0 z-50 bg-background border border-slate-200 rounded-lg shadow-sm p-3 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedChecklists.length} {selectedChecklists.length === 1 ? 'checklist selecionado' : 'checklists selecionados'}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Ativar selecionados
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Inativar selecionados
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              disabled={isDeleting}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir selecionados</span>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checklists.map((checklist) => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
            onStatusChange={onStatusChange}
            isSelected={selectedChecklists.includes(checklist.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklists selecionados</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir {selectedChecklists.length} {selectedChecklists.length === 1 ? 'checklist' : 'checklists'}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
