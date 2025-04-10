
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

interface ChecklistListProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void; 
  onOpen: (id: string) => void;
  onStatusChange: () => void;
  onBulkStatusChange: (ids: string[], newStatus: 'active' | 'inactive') => Promise<void>;
  onBulkDelete?: (ids: string[]) => void;
}

/**
 * Component for displaying checklists in a table view
 */
export function ChecklistList({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkStatusChange,
  onBulkDelete
}: ChecklistListProps) {
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear selections when checklist data changes
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

  const handleBulkActivate = async () => {
    if (selectedChecklists.length === 0) return;
    
    try {
      await onBulkStatusChange(selectedChecklists, 'active');
      toast.success(`${selectedChecklists.length} checklists ativados com sucesso`);
      setSelectedChecklists([]);
    } catch (error) {
      console.error("Error activating checklists:", error);
      toast.error("Erro ao ativar checklists");
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedChecklists.length === 0) return;
    
    try {
      await onBulkStatusChange(selectedChecklists, 'inactive');
      toast.success(`${selectedChecklists.length} checklists desativados com sucesso`);
      setSelectedChecklists([]);
    } catch (error) {
      console.error("Error deactivating checklists:", error);
      toast.error("Erro ao desativar checklists");
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
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={() => setIsDeleteDialogOpen(true)}
        isDeleting={isDeleting}
      />
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedChecklists.length === filteredChecklists.length && filteredChecklists.length > 0}
                  onCheckedChange={handleSelectAll}
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
                onView={onOpen}
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
