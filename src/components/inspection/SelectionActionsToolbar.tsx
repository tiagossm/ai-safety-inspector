
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SelectionActionsToolbarProps {
  selectedCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: (selected: boolean) => void;
  onDelete: () => void;
  onExport: (format: string) => void;
  isDeleting: boolean;
}

export function SelectionActionsToolbar({
  selectedCount,
  isAllSelected,
  onToggleSelectAll,
  onDelete,
  onExport,
  isDeleting
}: SelectionActionsToolbarProps) {
  return (
    <div className="bg-accent rounded-md p-3 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center">
        <Checkbox 
          checked={isAllSelected}
          onCheckedChange={onToggleSelectAll}
          className="mr-2 h-4 w-4"
        />
        <span className="text-sm">
          {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("excel")}>
              Exportar como Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("csv")}>
              Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("pdf")}>
              Exportar como PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="destructive"
          size="sm"
          className="h-8"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash className="mr-2 h-4 w-4" />
          {isDeleting ? "Excluindo..." : "Excluir Selecionados"}
        </Button>
      </div>
    </div>
  );
}
