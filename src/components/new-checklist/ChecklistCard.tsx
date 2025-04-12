
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Badge } from "@/components/ui/badge";
import { ChecklistCardBadges } from "./ChecklistCardBadges";
import { CalendarDays, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CheckIcon, XIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/utils/format";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";

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
  
  // Convert origin string to the expected type
  const originValue = checklist.origin as "manual" | "ia" | "csv" | undefined;
  
  const handleStatusChange = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsChangingStatus(true);
    try {
      const newStatus = checklist.status === "active" ? "inactive" : "active";
      
      const { error } = await supabase
        .from("checklists")
        .update({ status: newStatus })
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
        description: `O checklist agora está ${newStatus === "active" ? "ativo" : "inativo"}.`,
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do checklist.",
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleClick = () => {
    onOpen(checklist.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(checklist.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(checklist.id, checklist.title);
  };

  return (
    <Card className="group cursor-pointer" onClick={handleClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {onSelect && (
            <Checkbox
              id={`select-${checklist.id}`}
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(checklist.id, !!checked)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <Label htmlFor={`select-${checklist.id}`} className="text-lg font-semibold">
            {checklist.title}
          </Label>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditClick}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteClick}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChecklistOriginBadge origin={originValue} />
              <Badge variant={checklist.status === "active" ? "default" : "secondary"}>
                {checklist.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              {checklist.isTemplate && <Badge variant="outline">Template</Badge>}
            </div>
            <div className="flex items-center gap-1">
              <Switch 
                checked={checklist.status === "active"} 
                disabled={isChangingStatus}
                onClick={handleStatusChange}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {checklist.description || "Sem descrição"}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>Criado em {formatDate(checklist.createdAt || "")}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{checklist.totalQuestions || 0} perguntas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
