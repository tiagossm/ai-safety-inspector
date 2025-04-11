import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn, formatDate, truncateText } from "@/utils/utils";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";

interface ChecklistRowProps {
  checklist: ChecklistWithStats;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const ChecklistRow: React.FC<ChecklistRowProps> = ({ checklist, onSelect, isSelected, onView, onEdit, onDelete, onDuplicate }) => {
  const rowClasses = cn(
    "grid grid-cols-[40px_1fr_120px_140px_100px] items-center gap-4 py-3 px-4 rounded-md border text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
    isSelected && "bg-primary/5 border-primary/30"
  );
  
  return (
    <div className={`${rowClasses} ${isSelected ? 'bg-primary/5 border-primary/30' : ''}`}>
      {onSelect && (
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded-sm border-gray-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          checked={isSelected}
          onChange={() => onSelect(checklist.id)}
        />
      )}
      
      <div className="flex-1 sm:flex-[1.8] min-w-0">
        <h3 className="font-medium mb-1 truncate" title={checklist.title}>{checklist.title}</h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={checklist.isTemplate ? "secondary" : "default"} className="text-xs">
            {checklist.isTemplate ? "Template" : "Checklist"}
          </Badge>
          <ChecklistOriginBadge origin={checklist.origin} />
          {checklist.category && (
            <Badge variant="outline" className="text-xs">{checklist.category}</Badge>
          )}
        </div>
      </div>
      
      <div className="text-muted-foreground">{formatDate(checklist.createdAt)}</div>
      <div className="text-muted-foreground">{checklist.companyName || "-"}</div>
      
      <div className="flex justify-end gap-2">
        {onView && (
          <Button variant="ghost" size="icon" onClick={() => onView(checklist.id)}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
        
        {(onEdit || onDelete || onDuplicate) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(checklist.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(checklist.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Duplicar</span>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(checklist.id)} className="text-red-500 focus:text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Excluir</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
