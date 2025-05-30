
import React, { useState } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, Plus } from "lucide-react";
import { ChecklistCard } from "./ChecklistCard";
import { BulkDeleteDialog } from "./BulkDeleteDialog";
import { useNavigate } from "react-router-dom";

interface ChecklistGridProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void; // This is actually refetch
  onUpdateStatus: (params: { checklistId: string; newStatus: "active" | "inactive" }) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
}

export function ChecklistGrid({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onUpdateStatus,
  onBulkDelete
}: ChecklistGridProps) {
  const navigate = useNavigate();
  // State for tracking selected checklists
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedChecklists(prev => 
      selected ? [...prev, id] : prev.filter(checklistId => checklistId !== id)
    );
  };

  const handleBulkDelete = () => {
    if (selectedChecklists.length > 0) {
      setIsBulkDeleteConfirmOpen(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (!selectedChecklists.length || !onBulkDelete) {
      setIsBulkDeleteConfirmOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await onBulkDelete(selectedChecklists);
      setSelectedChecklists([]);
    } catch (error) {
      console.error("Error during bulk delete:", error);
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteConfirmOpen(false);
    }
  };

  const handleCreateChecklist = () => {
    navigate("/new-checklists/create");
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
        <Button className="gap-2" onClick={handleCreateChecklist}>
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
          <span className="text-sm">{selectedChecklists.length} checklists selecionados</span>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir selecionados"}
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
            onStatusChange={onStatusChange} // Keep for now, might be used by other actions or until ChecklistList is updated
            onUpdateStatus={onUpdateStatus}
            isSelected={selectedChecklists.includes(checklist.id)}
            onSelect={(checked) => handleSelect(checklist.id, checked)}
          />
        ))}
      </div>

      <BulkDeleteDialog 
        isOpen={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        selectedCount={selectedChecklists.length}
        isDeleting={isDeleting}
        onConfirmDelete={handleConfirmBulkDelete}
      />
    </div>
  );
}
