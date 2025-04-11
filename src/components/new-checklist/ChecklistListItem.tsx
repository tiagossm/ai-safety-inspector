import React from "react";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreVertical, Copy, Pencil, Trash } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChecklistWithStats } from "@/types/newChecklist";
import { useNavigate } from "react-router-dom";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";

interface ChecklistListItemProps {
  checklist: ChecklistWithStats;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const ChecklistListItem = ({ checklist, onView, onEdit, onDelete, onDuplicate }: ChecklistListItemProps) => {
  const navigate = useNavigate();
  
  return (
    <li className="border rounded-lg bg-white overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium text-lg">{checklist.title}</h3>
        </div>
        
        {/* Update to pass origin as string */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge variant={checklist.isTemplate ? "secondary" : "default"} className="text-xs">
            {checklist.isTemplate ? "Template" : "Checklist"}
          </Badge>
          <ChecklistOriginBadge origin={checklist.origin} />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="h-4 w-4 text-gray-500 cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView && onView(checklist.id)}>
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit && onEdit(checklist.id)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate && onDuplicate(checklist.id)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete && onDelete(checklist.id)} className="text-red-500">
              <Trash className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium text-lg">{checklist.title}</h3>
        </div>
        
        {/* Update to pass origin as string */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge variant={checklist.isTemplate ? "secondary" : "default"} className="text-xs">
            {checklist.isTemplate ? "Template" : "Checklist"}
          </Badge>
          <ChecklistOriginBadge origin={checklist.origin} />
        </div>
        
        <p className="text-sm text-gray-500">{checklist.description}</p>
      </div>
    </li>
  );
};
