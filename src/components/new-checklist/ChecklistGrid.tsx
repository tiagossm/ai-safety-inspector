
import React, { useState } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, Plus } from "lucide-react";
import { ChecklistCard } from "./ChecklistCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface ChecklistGridProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void;
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
  // State for tracking selected checklists
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedChecklists(prev => 
      selected ? [...prev, id] : prev.filter(checklistId => checklistId !== id)
    );
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedChecklists.length > 0 && onBulkDelete) {
      await onBulkDelete(selectedChecklists);
      setSelectedChecklists([]);
    }
    setIsBulkDeleteConfirmOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando checklists...</p>
        </div>
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Não foram encontrados checklists com os filtros atuais. Tente ajustar os filtros ou criar um novo checklist.
        </p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Criar Checklist</span>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {selectedChecklists.length > 0 && (
        <div className="mb-4 p-3 bg-muted rounded-md flex items-center justify-between">
          <span>{selectedChecklists.length} checklists selecionados</span>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setIsBulkDeleteConfirmOpen(true)}
          >
            Excluir selecionados
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {checklists.map((checklist) => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
            onStatusChange={onStatusChange}
            isSelected={selectedChecklists.includes(checklist.id)}
            onSelect={(checked) => handleSelect(checklist.id, checked)}
          />
        ))}
      </div>

      <AlertDialog 
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklists selecionados</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedChecklists.length} checklists?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleConfirmBulkDelete}
            >
              Confirmar exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
