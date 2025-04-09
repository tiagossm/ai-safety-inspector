
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChecklistWithStats } from "@/types/newChecklist";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { Eye, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ChecklistRowProps {
  checklist: ChecklistWithStats;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void;
}

export function ChecklistRow({
  checklist,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange
}: ChecklistRowProps) {
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      onStatusChange();
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <TableRow className={isSelected ? "bg-muted/50" : ""}>
      <TableCell>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell className="font-medium">{checklist.title}</TableCell>
      <TableCell>{checklist.companyName || "—"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {checklist.category || "Sem categoria"}
          </Badge>
          <ChecklistOriginBadge origin={checklist.origin || 'manual'} />
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant={checklist.status === "active" ? "default" : "secondary"}
        >
          {checklist.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      <TableCell>
        {checklist.createdAt 
          ? format(new Date(checklist.createdAt), "dd/MM/yyyy", { locale: ptBR })
          : "—"
        }
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpen(checklist.id)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(checklist.id)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <span className="sr-only">Ações</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleToggleStatus}
                disabled={isToggling}
              >
                {checklist.status === 'active' ? (
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
                onClick={() => onDelete(checklist.id, checklist.title)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
