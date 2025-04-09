
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  isDeleting?: boolean;
}

/**
 * Toolbar for bulk actions on selected checklists
 */
export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  isDeleting = false
}) => {
  if (selectedCount === 0) return null;
  
  return (
    <div className="sticky top-0 z-50 bg-background border border-slate-200 rounded-lg shadow-sm p-3 mb-4 flex items-center justify-between">
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? 'checklist selecionado' : 'checklists selecionados'}
      </span>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBulkActivate}
        >
          Ativar selecionados
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBulkDeactivate}
        >
          Inativar selecionados
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onBulkDelete}
          disabled={isDeleting}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          <span>Excluir selecionados</span>
        </Button>
      </div>
    </div>
  );
};
