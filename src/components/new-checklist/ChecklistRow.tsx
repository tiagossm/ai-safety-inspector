
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { 
  ArrowUpRight, 
  Pencil, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ChecklistRowProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

export function ChecklistRow({
  checklist,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  isSelected,
  onSelect
}: ChecklistRowProps) {
  const { toast } = useToast();
  
  const originValue = checklist.origin as "manual" | "ia" | "csv" | undefined;
  const isActive = checklist.status === "active";
  
  const handleStatusChange = async () => {
    try {
      const newStatus = isActive ? "inactive" : "active";
      const { error } = await supabase
        .from("checklists")
        .update({ status_checklist: newStatus === "active" ? "ativo" : "inativo" })
        .eq("id", checklist.id);
        
      if (error) throw error;
      
      toast({
        title: "Status atualizado",
        description: `O checklist foi ${newStatus === "active" ? "ativado" : "desativado"}.`,
      });
      
      onStatusChange();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do checklist."
      });
    }
  };

  return (
    <TooltipProvider>
      <TableRow className={isSelected ? 'bg-primary/5' : undefined}>
        <TableCell className="w-[50px]">
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </TableCell>
        
        <TableCell>
          <div className="flex flex-col">
            <div 
              className="font-medium hover:text-primary cursor-pointer"
              onClick={() => onOpen(checklist.id)}
            >
              {checklist.title}
            </div>
            {checklist.description && (
              <div className="text-xs text-muted-foreground line-clamp-1">
                {checklist.description}
              </div>
            )}
          </div>
        </TableCell>
        
        <TableCell>
          {originValue && <ChecklistOriginBadge origin={originValue} showLabel />}
        </TableCell>
        
        <TableCell>
          <span className="text-sm truncate block max-w-[150px]">
            {checklist.companyName || <span className="text-muted-foreground italic">Nenhuma</span>}
          </span>
        </TableCell>
        
        <TableCell>
          <span className="text-sm truncate block max-w-[150px]">
            {checklist.createdByName || <span className="text-muted-foreground italic">Sistema</span>}
          </span>
        </TableCell>
        
        <TableCell>
          {checklist.category ? (
            <Badge variant="outline" className="font-normal">
              {checklist.category}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs italic">Não definida</span>
          )}
        </TableCell>
        
        <TableCell>
          <Badge 
            variant={checklist.isTemplate ? "outline" : (isActive ? "default" : "secondary")}
            className={`${checklist.isTemplate ? "" : (isActive ? "" : "text-muted-foreground")}`}
          >
            {checklist.isTemplate ? "Template" : (isActive ? "Ativo" : "Inativo")}
          </Badge>
        </TableCell>
        
        <TableCell>
          {formatDate(checklist.createdAt || "")}
        </TableCell>
        
        <TableCell className="text-right">
          <div className="flex items-center justify-end space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => onOpen(checklist.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visualizar checklist</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => onEdit(checklist.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar checklist</p>
              </TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => onOpen(checklist.id)}>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  <span>Abrir checklist</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleStatusChange}>
                  {isActive ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                      <span>Desativar checklist</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span>Ativar checklist</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(checklist.id, checklist.title)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Excluir checklist</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
    </TooltipProvider>
  );
}
