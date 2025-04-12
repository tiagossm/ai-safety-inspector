
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Pencil, 
  Trash2, 
  MoreVertical, 
  CheckCircle, 
  XCircle,
  Building2,
  FileText,
  User
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  
  return (
    <TooltipProvider>
      <Card className={`transition-all hover:shadow-md ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent/20'}`}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-2">
            {onSelect && (
              <Checkbox 
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(checklist.id, checked === true)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
            )}
            
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 
                  className="font-medium text-base truncate cursor-pointer hover:text-primary"
                  onClick={() => onOpen(checklist.id)}
                >
                  {checklist.title}
                </h3>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuItem onClick={() => onOpen(checklist.id)}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Ver detalhes</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(checklist.id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleStatusChange} disabled={isChangingStatus}>
                      {isActiveStatus ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                          <span>Desativar</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span>Ativar</span>
                        </>
                      )}
                    </DropdownMenuItem>
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
              
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={checklist.isTemplate ? "outline" : isActiveStatus ? "default" : "secondary"}>
                  {checklist.isTemplate ? "Template" : isActiveStatus ? "Ativo" : "Inativo"}
                </Badge>
                
                {checklist.category && (
                  <Badge variant="outline" className="text-xs">
                    {checklist.category}
                  </Badge>
                )}
                
                {originValue && <ChecklistOriginBadge origin={originValue} />}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            {checklist.description && (
              <p className="line-clamp-2">
                {checklist.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data de criação</p>
                  </TooltipContent>
                </Tooltip>
                <span>{formatDate(checklist.createdAt || "")}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Criado por</p>
                  </TooltipContent>
                </Tooltip>
                <span className="truncate">{checklist.createdByName || "Sistema"}</span>
              </div>
              
              {checklist.companyName && (
                <div className="flex items-center gap-2 col-span-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{checklist.companyName}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 px-5 pb-4 flex justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Itens:</span>
              <span className="text-xs">{checklist.totalQuestions || 0}</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => onOpen(checklist.id)}>
            Abrir
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
