
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Edit, Trash2, MoreHorizontal, CheckSquare, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/format";
import { Progress } from "@/components/ui/progress";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export const ChecklistCard = ({
  checklist,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  isSelected = false,
  onSelect
}: ChecklistCardProps) => {
  const [isToggling, setIsToggling] = useState(false);
  const [status, setStatus] = useState(checklist.status);
  
  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;
    
    // Optimistic UI update
    const newStatus = status === 'active' ? 'inactive' : 'active';
    setStatus(newStatus);
    setIsToggling(true);
    
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ status: newStatus })
        .eq('id', checklist.id);
      
      if (error) throw error;
      
      toast.success(newStatus === 'active' ? "Checklist ativado" : "Checklist desativado");
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      // Rollback on error
      setStatus(status);
      console.error("Error toggling checklist status:", error);
      toast.error("Erro ao alterar status do checklist");
    } finally {
      setIsToggling(false);
    }
  };

  // Calculate progress if we have the data
  const progress = checklist.totalQuestions && checklist.completedQuestions
    ? Math.round((checklist.completedQuestions / checklist.totalQuestions) * 100)
    : 0;

  return (
    <Card 
      className={`h-full flex flex-col border border-slate-200 shadow-sm rounded-xl transition-all
        ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:shadow-md'}`}
      onClick={() => onOpen(checklist.id)}
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div className="flex flex-col mb-2">
            <div className="flex items-center gap-2 mb-1">
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelect(checklist.id, checked === true)}
                  onClick={(e) => e.stopPropagation()}
                  className={`${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                />
              )}
              <Badge variant={checklist.isTemplate ? "secondary" : "default"} className="px-2 py-0">
                {checklist.isTemplate ? "Template" : status === 'active' ? "Ativo" : "Inativo"}
              </Badge>
              <ChecklistOriginBadge origin={checklist.origin} />
            </div>
            
            <h3 className="text-base font-medium line-clamp-2 mb-1">{checklist.title}</h3>
            
            {checklist.companyName ? (
              <p className="text-sm text-muted-foreground truncate">
                {checklist.companyName}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Sem empresa associada
              </p>
            )}
          </div>
          
          <div className="flex items-center">
            {!checklist.isTemplate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Switch 
                      checked={status === 'active'}
                      onClick={toggleStatus}
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
                  onEdit(checklist.id);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  toggleStatus(e);
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
                    onDelete(checklist.id, checklist.title);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Excluir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mt-auto">
          {checklist.category && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs font-normal">
                {checklist.category}
              </Badge>
            </div>
          )}
          
          {checklist.totalQuestions > 0 && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span>{checklist.completedQuestions || 0} de {checklist.totalQuestions} itens</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-3">
            Criado em {formatDate(checklist.createdAt || "")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
