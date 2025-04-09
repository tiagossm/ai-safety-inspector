
import React, { useState } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowRight, Power, PowerOff } from "lucide-react";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      const newStatus = checklist.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('checklists')
        .update({ status: newStatus })
        .eq('id', checklist.id);
        
      if (error) throw error;
      
      toast.success(
        newStatus === 'active'
          ? "Checklist ativado com sucesso"
          : "Checklist desativado com sucesso"
      );
      
      onStatusChange();
    } catch (error) {
      console.error("Error toggling checklist status:", error);
      toast.error("Erro ao alterar status do checklist");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <TableRow 
      className={isSelected ? "bg-muted/40" : undefined}
      onClick={() => onOpen(checklist.id)}
    >
      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={(checked) => onSelect(!!checked)} 
        />
      </TableCell>
      <TableCell>
        <div className="font-medium">{checklist.title}</div>
        <div className="text-sm text-muted-foreground truncate max-w-[250px]">
          {checklist.description || "Sem descrição"}
        </div>
      </TableCell>
      <TableCell>
        {checklist.companyName || <span className="text-muted-foreground italic">Sem empresa</span>}
      </TableCell>
      <TableCell>
        {checklist.category || <span className="text-muted-foreground italic">-</span>}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {checklist.is_template && (
            <Badge variant="secondary" className="text-xs font-normal">
              Template
            </Badge>
          )}
          <Badge 
            variant={checklist.status === "active" ? "outline" : "outline"} 
            className={`text-xs font-normal ${
              checklist.status === "active"
                ? "border-green-200 text-green-600 bg-green-50"
                : "border-red-200 text-red-500 bg-red-50"
            }`}
          >
            {checklist.status === "active" ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        {formatDate(checklist.created_at || "")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => onEdit(checklist.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleStatus}
            disabled={isToggling}
          >
            {checklist.status === 'active' ? (
              <PowerOff className="h-4 w-4" />
            ) : (
              <Power className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation();
            onDelete(checklist.id, checklist.title);
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onOpen(checklist.id)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
