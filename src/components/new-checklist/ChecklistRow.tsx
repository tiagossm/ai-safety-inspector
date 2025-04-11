
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Copy } from "lucide-react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ptBR } from "date-fns/locale";

export interface ChecklistRowProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  onStatusChange?: () => void;
  onDuplicate?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export function ChecklistRow({
  checklist,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  onDuplicate,
  isSelected = false,
  onSelect
}: ChecklistRowProps) {
  const formattedDate = checklist.createdAt 
    ? format(new Date(checklist.createdAt), 'dd/MM/yyyy', { locale: ptBR })
    : 'Data desconhecida';

  return (
    <TableRow className={cn(isSelected && "bg-muted/50")}>
      {onSelect && (
        <TableCell className="w-12">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={(checked) => onSelect(checked === true)}
          />
        </TableCell>
      )}
      
      <TableCell className="font-medium">
        <div className="max-w-xs truncate">
          {checklist.title}
        </div>
        <div className="flex gap-2 mt-1">
          {checklist.isTemplate && (
            <Badge variant="outline" className="bg-blue-50 text-xs">Template</Badge>
          )}
          {checklist.category && (
            <Badge variant="outline" className="text-xs">{checklist.category}</Badge>
          )}
        </div>
      </TableCell>

      <TableCell>{checklist.companyName || "-"}</TableCell>
      
      <TableCell>{checklist.category || "-"}</TableCell>
      
      <TableCell>
        <Badge 
          variant={checklist.status === "active" ? "default" : "secondary"}
          className="capitalize"
        >
          {checklist.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      
      <TableCell>{formattedDate}</TableCell>
      
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {onView && (
            <Button variant="ghost" size="icon" onClick={() => onView(checklist.id)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" onClick={() => onEdit(checklist.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          
          {onDuplicate && (
            <Button variant="ghost" size="icon" onClick={() => onDuplicate(checklist.id)}>
              <Copy className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(checklist.id)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
