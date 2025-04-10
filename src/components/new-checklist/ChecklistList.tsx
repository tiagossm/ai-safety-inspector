
import React, { useState } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistListItem } from "./ChecklistListItem";
import { ChecklistEmptyState } from "./ChecklistEmptyState";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface ChecklistListProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void;
  onBulkDelete?: (ids: string[]) => Promise<boolean>;
  onBulkStatusChange: (ids: string[], newStatus: "active" | "inactive") => Promise<void>;
}

export function ChecklistList({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkDelete,
  onBulkStatusChange
}: ChecklistListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [isBulkActing, setIsBulkActing] = useState(false);

  if (isLoading) {
    return <div className="space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="h-[72px] bg-gray-100 animate-pulse rounded-md"></div>
      ))}
    </div>;
  }

  if (checklists.length === 0) {
    return <ChecklistEmptyState message="Não foram encontrados checklists com os filtros atuais." />;
  }

  const handleSelectChecklist = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      if (selected) {
        return [...prev, id];
      } else {
        return prev.filter(i => i !== id);
      }
    });
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedIds.length === 0) return;
    
    setBulkAction("delete");
    setIsConfirmDialogOpen(true);
  };

  const handleBulkActivate = () => {
    if (selectedIds.length === 0) return;
    
    setBulkAction("activate");
    setIsConfirmDialogOpen(true);
  };

  const handleBulkDeactivate = () => {
    if (selectedIds.length === 0) return;
    
    setBulkAction("deactivate");
    setIsConfirmDialogOpen(true);
  };

  const executeBulkAction = async () => {
    setIsBulkActing(true);
    try {
      if (bulkAction === "delete" && onBulkDelete) {
        const success = await onBulkDelete(selectedIds);
        if (success) {
          toast.success(`${selectedIds.length} checklists excluídos com sucesso`);
          setSelectedIds([]);
        } else {
          toast.error("Houve um erro ao excluir alguns checklists");
        }
      } else if (bulkAction === "activate") {
        await onBulkStatusChange(selectedIds, "active");
        toast.success(`${selectedIds.length} checklists ativados com sucesso`);
        setSelectedIds([]);
      } else if (bulkAction === "deactivate") {
        await onBulkStatusChange(selectedIds, "inactive");
        toast.success(`${selectedIds.length} checklists desativados com sucesso`);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Error in bulk action:", error);
      toast.error(`Erro ao executar ação em massa`);
    } finally {
      setIsBulkActing(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
        isDeleting={isBulkActing}
      />

      {checklists.filter(c => !c.isSubChecklist).map((checklist) => (
        <ChecklistListItem
          key={checklist.id}
          checklist={checklist}
          isSelected={selectedIds.includes(checklist.id)}
          onSelect={handleSelectChecklist}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      ))}

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "delete" ? "Excluir checklists selecionados" : 
               bulkAction === "activate" ? "Ativar checklists selecionados" : 
               "Desativar checklists selecionados"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "delete" ? 
                `Tem certeza que deseja excluir ${selectedIds.length} checklists? Esta ação não pode ser desfeita.` : 
                `Tem certeza que deseja ${bulkAction === "activate" ? "ativar" : "desativar"} ${selectedIds.length} checklists?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkActing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkAction}
              disabled={isBulkActing}
              className={bulkAction === "delete" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isBulkActing ? "Processando..." : bulkAction === "delete" ? "Excluir" : bulkAction === "activate" ? "Ativar" : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
