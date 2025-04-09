
import React, { useState, useEffect } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
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
import { ChecklistLoadingSkeleton } from "./ChecklistLoadingSkeleton";
import { ChecklistEmptyState } from "./ChecklistEmptyState";
import { ChecklistRow } from "./ChecklistRow";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { updateBulkChecklistStatus } from "@/services/checklist/checklistService";

interface ChecklistListProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function ChecklistList({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkDelete
}: ChecklistListProps) {
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSelectedChecklists([]);
  }, [checklists]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChecklists(checklists.filter(c => !c.isSubChecklist).map(c => c.id));
    } else {
      setSelectedChecklists([]);
    }
  };

  const handleSelectChecklist = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedChecklists([...selectedChecklists, id]);
    } else {
      setSelectedChecklists(selectedChecklists.filter(checklistId => checklistId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (onBulkDelete && selectedChecklists.length > 0) {
      setIsDeleting(true);
      try {
        await onBulkDelete(selectedChecklists);
        toast.success(`${selectedChecklists.length} checklists excluídos com sucesso`);
        setSelectedChecklists([]);
      } catch (error) {
        console.error("Error deleting checklists:", error);
        toast.error("Erro ao excluir checklists");
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (selectedChecklists.length === 0) return;
    
    const statusText = newStatus === 'active' ? 'ativando' : 'desativando';
    const loadingToast = toast.loading(`${statusText} ${selectedChecklists.length} checklists...`);
    
    try {
      await updateBulkChecklistStatus(selectedChecklists, newStatus);
      toast.success(`${selectedChecklists.length} checklists ${newStatus === 'active' ? 'ativados' : 'desativados'} com sucesso`);
      
      if (onStatusChange) onStatusChange();
      setSelectedChecklists([]);
    } catch (error) {
      console.error(`Error ${statusText} checklists:`, error);
      toast.error(`Erro ao ${statusText.replace('ando', 'ar')} checklists`);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  if (isLoading) {
    return <ChecklistLoadingSkeleton />;
  }

  if (checklists.length === 0) {
    return <ChecklistEmptyState message="Não foram encontrados checklists com os filtros atuais." />;
  }

  const filteredChecklists = checklists.filter(
    checklist => !checklist.isSubChecklist
  );

  return (
    <div className="space-y-4">
      <BulkActionsToolbar 
        selectedCount={selectedChecklists.length}
        onBulkActivate={() => handleBulkStatusChange('active')}
        onBulkDeactivate={() => handleBulkStatusChange('inactive')}
        onBulkDelete={() => setIsDeleteDialogOpen(true)}
      />
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  checked={selectedChecklists.length === filteredChecklists.length && filteredChecklists.length > 0}
                  aria-checked={selectedChecklists.length > 0 && selectedChecklists.length < filteredChecklists.length ? 'mixed' : undefined}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChecklists.map((checklist) => (
              <ChecklistRow
                key={checklist.id}
                checklist={checklist}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpen={onOpen}
                onStatusChange={onStatusChange}
                isSelected={selectedChecklists.includes(checklist.id)}
                onSelect={(checked) => handleSelectChecklist(checklist.id, checked)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklists selecionados</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedChecklists.length} {selectedChecklists.length === 1 ? 'checklist' : 'checklists'}.
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
    </div>
  );
}
