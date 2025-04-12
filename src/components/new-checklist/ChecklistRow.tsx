import React, { useState, useEffect } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MoreHorizontal, Archive, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { fetchCompanyNameById, updateChecklistStatus } from "@/services/checklist/checklistService";

interface ChecklistRowProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
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
  const [companyName, setCompanyName] = useState<string | null>(checklist.companyName || null);
  const [companyLoading, setCompanyLoading] = useState<boolean>(!!checklist.companyId && !checklist.companyName);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [status, setStatus] = useState(checklist.status);

  useEffect(() => {
    if (checklist.companyId && !companyName) {
      loadCompanyName(checklist.companyId);
    }
  }, [checklist.companyId, companyName]);

  const loadCompanyName = async (companyId: string) => {
    try {
      setCompanyLoading(true);
      const name = await fetchCompanyNameById(companyId);
      setCompanyName(name);
    } catch (error) {
      console.error("Error fetching company name:", error);
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;
    
    // Optimistic UI update
    const newStatus = status === 'active' ? 'inactive' : 'active';
    setStatus(newStatus);
    setIsToggling(true);
    
    try {
      await updateChecklistStatus(checklist.id, newStatus);
      toast.success(`Checklist ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`);
      
      if (onStatusChange) onStatusChange();
    } catch (error) {
      // Rollback on error
      setStatus(status);
      console.error("Error toggling checklist status:", error);
      toast.error("Erro ao alterar status do checklist");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-accent/50 group"
      onClick={() => onOpen(checklist.id)}
    >
      <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={(checked) => onSelect(!!checked)}
          className={`${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        />
      </TableCell>
      <TableCell className="font-medium min-h-[56px] flex items-center gap-2 py-3">
        <ChecklistOriginBadge origin={(checklist.origin || "manual") as "manual" | "ia" | "csv"} showLabel={false} />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate max-w-[250px]">{checklist.title}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{checklist.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        {companyLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : companyName ? (
          <div className="flex items-center gap-1 truncate max-w-[200px]">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{companyName}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{companyName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <span className="text-muted-foreground italic">Sem empresa</span>
        )}
      </TableCell>
      <TableCell>
        {checklist.category ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[150px] inline-block">{checklist.category}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{checklist.category}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground italic">-</span>
        )}
      </TableCell>
      <TableCell>
        <div 
          className="flex items-center gap-3" 
          onClick={(e) => e.stopPropagation()}
        >
          {checklist.isTemplate ? (
            <Badge variant="secondary">Template</Badge>
          ) : (
            <>
              <Badge 
                variant={status === "active" ? "default" : "outline"}
                className={`
                  transition-colors duration-300 
                  ${status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-gray-100 text-gray-600 border-gray-300'}
                `}
              >
                {status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`
                        transition-all duration-300 
                        ${status === 'active' 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' 
                          : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'}
                      `}
                      onClick={handleToggleStatus}
                      disabled={isToggling}
                    >
                      {status === 'active' ? (
                        <Archive className="h-4 w-4 mr-1" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      {status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {status === 'active' 
                        ? 'Clique para desativar este checklist' 
                        : 'Clique para ativar este checklist'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        {checklist.createdAt && format(new Date(checklist.createdAt), "dd MMM yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onOpen(checklist.id);
            }}>
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit(checklist.id);
            }}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(checklist.id, checklist.title);
              }}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
