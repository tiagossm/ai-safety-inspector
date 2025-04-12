
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Pencil, 
  Trash2, 
  MoreVertical,
  ExternalLink,
  Building2,
  FileText,
  User,
  CheckSquare,
  XSquare
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/format";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { useToast } from "@/components/ui/use-toast";

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onStatusChange?: () => void;
}

export function ChecklistCard({
  checklist,
  onEdit,
  onDelete,
  onOpen,
  isSelected = false,
  onSelect,
  onStatusChange
}: ChecklistCardProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const { toast } = useToast();
  
  const originValue = checklist.origin as "manual" | "ia" | "csv" | undefined;
  
  const handleStatusChange = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsChangingStatus(true);
    try {
      const newStatus = checklist.status === "active" ? "inactive" : "active";
      
      const { error } = await supabase
        .from("checklists")
        .update({ status_checklist: newStatus === "active" ? "ativo" : "inativo" })
        .eq("id", checklist.id);
        
      if (error) {
        console.error("Error updating checklist status:", error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: error.message,
        });
        return;
      }
      
      toast({
        title: "Status atualizado",
        description: `O checklist "${checklist.title}" foi ${newStatus === "active" ? "ativado" : "desativado"}.`,
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do checklist.",
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  const isActiveStatus = checklist.status === "active";
  const statusIcon = isActiveStatus ? 
    <CheckSquare className="h-4 w-4 text-emerald-600" /> : 
    <XSquare className="h-4 w-4 text-amber-500" />;
  
  return (
    <TooltipProvider>
      <Card 
        className={`transition-all hover:border-primary cursor-pointer group ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent/10'}`}
        onClick={() => onOpen(checklist.id)}
      >
        <CardContent className="p-5 pt-5">
          <div className="flex justify-between items-start mb-2.5">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={isActiveStatus ? "default" : "secondary"} className="capitalize">
                {statusIcon}
                <span className="ml-1">{isActiveStatus ? "Ativo" : "Inativo"}</span>
              </Badge>
              
              {checklist.isTemplate && (
                <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                  Template
                </Badge>
              )}
              
              {checklist.category && (
                <Badge variant="outline" className="text-xs">
                  {checklist.category}
                </Badge>
              )}
              
              {originValue && <ChecklistOriginBadge origin={originValue} />}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(checklist.id); }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(e); }} disabled={isChangingStatus}>
                  {isActiveStatus ? (
                    <>
                      <XSquare className="mr-2 h-4 w-4 text-amber-500" />
                      <span>Desativar</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="mr-2 h-4 w-4 text-emerald-600" />
                      <span>Ativar</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(checklist.id, checklist.title); }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Excluir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <h3 className="font-medium text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {checklist.title}
          </h3>
          
          {checklist.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {checklist.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
            {checklist.companyName && (
              <div className="flex items-center gap-2 col-span-2 mb-1">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate font-medium" title={checklist.companyName}>{checklist.companyName}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{formatDate(checklist.createdAt || "")}</span>
            </div>
            
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">
                {checklist.totalQuestions || 0} {(checklist.totalQuestions === 1) ? 'item' : 'itens'}
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-0 border-t">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-9 rounded-none w-full justify-center hover:bg-muted group-hover:text-primary font-medium transition-colors"
            onClick={(e) => { e.stopPropagation(); onOpen(checklist.id); }}
          >
            <span>Abrir</span>
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
