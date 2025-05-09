
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
import { Loading } from "@/components/ui/Loading";

interface SelectionActionsToolbarProps {
  selectedCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: (selected: boolean) => void;
  onDelete: () => void;
  onExport: (format: string) => void;
  isDeleting: boolean;
  isExporting?: boolean;
}

export function SelectionActionsToolbar({
  selectedCount,
  isAllSelected,
  onToggleSelectAll,
  onDelete,
  onExport,
  isDeleting,
  isExporting = false
}: SelectionActionsToolbarProps) {
  return (
    <div className="bg-accent/30 rounded-md p-3 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-10 shadow-sm border border-border">
      <div className="flex items-center gap-2">
        <Checkbox 
          checked={isAllSelected}
          onCheckedChange={onToggleSelectAll}
          className="mr-2 h-4 w-4"
          aria-label="Selecionar todos os itens"
        />
        <span className="text-sm font-medium">
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
              disabled={isExporting}
            >
              {isExporting ? (
                <Loading size="sm" className="mr-2" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("excel")} disabled={isExporting}>
              Exportar como Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("csv")} disabled={isExporting}>
              Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("pdf")} disabled={isExporting}>
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
          {isDeleting ? (
            <Loading size="sm" className="mr-2" />
          ) : (
            <Trash className="mr-2 h-4 w-4" />
          )}
          {isDeleting ? "Excluindo..." : "Excluir Selecionados"}
        </Button>
      </div>
    </div>
  );
}
