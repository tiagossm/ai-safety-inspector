
import { ChecklistWithStats } from "@/types/newChecklist";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  FileText, 
  Pencil,
  CheckSquare, 
  XSquare,
  Trash2,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/utils/format";

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
  const { toast } = useToast();

  const isActive = checklist.status === "active";
  const originValue = checklist.origin as "manual" | "ia" | "csv" | undefined;
  
  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);
    
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
      console.error("Error toggling status:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar o status do checklist.",
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <TableRow className={isSelected ? "bg-primary/5" : "hover:bg-accent/10"}>
      <TableCell className="w-[50px]">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onSelect}
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div 
            className="font-medium cursor-pointer hover:text-primary transition-colors"
            onClick={() => onOpen(checklist.id)}
          >
            {checklist.title}
          </div>
          {checklist.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {checklist.description}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {originValue ? (
          <ChecklistOriginBadge origin={originValue} showLabel={true} />
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell>
        <span className={checklist.companyName ? "text-foreground" : "text-muted-foreground text-sm"}>
          {checklist.companyName || "-"}
        </span>
      </TableCell>
      <TableCell>
        <span className={checklist.createdByName ? "text-foreground" : "text-muted-foreground text-sm"}>
          {checklist.createdByName || "-"}
        </span>
      </TableCell>
      <TableCell>
        <span className={checklist.category ? "text-foreground" : "text-muted-foreground text-sm"}>
          {checklist.category || "-"}
        </span>
      </TableCell>
      <TableCell>
        <Badge 
          variant={isActive ? "default" : "secondary"}
          className="flex w-[80px] items-center justify-center gap-1.5 capitalize"
        >
          {isActive ? (
            <>
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Ativo</span>
            </>
          ) : (
            <>
              <XSquare className="h-3.5 w-3.5" />
              <span>Inativo</span>
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        {formatDate(checklist.createdAt || "")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpen(checklist.id)}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen(checklist.id)}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Abrir</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(checklist.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus} disabled={isToggling}>
                {isActive ? (
                  <>
                    <XSquare className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Desativar</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4 text-green-500" />
                    <span>Ativar</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(checklist.id, checklist.title)}
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
