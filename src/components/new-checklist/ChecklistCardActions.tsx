
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, PowerOff, Power } from "lucide-react";

interface ChecklistCardActionsProps {
  id: string;
  title: string;
  status: string;
  isTemplate: boolean;
  isToggling: boolean;
  onToggleStatus: (e: React.MouseEvent) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function ChecklistCardActions({
  id,
  title,
  status,
  isTemplate,
  isToggling,
  onToggleStatus,
  onEdit,
  onDelete
}: ChecklistCardActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onEdit(id);
        }}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={onToggleStatus}
          disabled={isToggling}
        >
          {status === 'active' ? (
            <>
              <PowerOff className="mr-2 h-4 w-4" />
              <span>Desativar</span>
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4" />
              <span>Ativar</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id, title);
          }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
