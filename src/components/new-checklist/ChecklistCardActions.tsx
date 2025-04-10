
import React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, CheckSquare, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

/**
 * Component for rendering checklist action buttons and dropdown
 */
export const ChecklistCardActions: React.FC<ChecklistCardActionsProps> = ({
  id,
  title,
  status,
  isTemplate,
  isToggling,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-center">
      {!isTemplate && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Switch 
                checked={status === 'active'}
                onClick={onToggleStatus}
                disabled={isToggling}
                className="mr-2"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{status === 'active' ? 'Desativar' : 'Ativar'} checklist</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(e);
          }}>
            {status === 'active' ? (
              <>
                <Archive className="mr-2 h-4 w-4" />
                <span>Desativar</span>
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                <span>Ativar</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id, title);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
