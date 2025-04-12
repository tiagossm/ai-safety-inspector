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
  
  const handleStatusChange = async () => {
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

  return (
    <Card className="group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {onSelect && (
            <Checkbox
              id={`select-${checklist.id}`}
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(checklist.id, checked)}
            />
          )}
          <Label htmlFor={`select-${checklist.id}`} className="text-lg font-semibold">
            {checklist.title}
          </Label>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpen(checklist.id)}>
              <FileText className="mr-2 h-4 w-4" />
              Abrir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(checklist.id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(checklist.id, checklist.title)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{checklist.description}</p>
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 opacity-70" />
            <span className="text-xs text-muted-foreground">
              Criado em {formatDate(checklist.createdAt)}
            </span>
          </div>
          <ChecklistCardBadges checklist={checklist} />
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {checklist.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
            <Switch
              id={`status-switch-${checklist.id}`}
              checked={checklist.status === "active"}
              onCheckedChange={handleStatusChange}
              disabled={isChangingStatus}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
