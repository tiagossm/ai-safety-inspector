
import { Button } from "@/components/ui/button";
import { CheckSquare, Archive, Trash2 } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;
  
  return (
    <div className="sticky top-0 z-50 flex justify-between items-center p-3 bg-background border border-slate-200 rounded-lg shadow-sm">
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? 'checklist selecionado' : 'checklists selecionados'}
      </span>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBulkActivate}
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          Ativar selecionados
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBulkDeactivate}
        >
          <Archive className="h-4 w-4 mr-1" />
          Inativar selecionados
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onBulkDelete}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Excluir selecionados</span>
        </Button>
      </div>
    </div>
  );
}
