
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Pencil, Trash2 } from "lucide-react";
import { ChecklistOriginBadge } from "@/components/new-checklist/ChecklistOriginBadge";
import { ChecklistWithStats } from "@/types/newChecklist";

interface ChecklistDetailsHeaderProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function ChecklistDetailsHeader({ 
  checklist, 
  onEdit, 
  onDelete 
}: ChecklistDetailsHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/new-checklists")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{checklist.title}</h1>
        <ChecklistOriginBadge 
          origin={checklist.origin as "manual" | "ia" | "csv" | undefined} 
          showLabel={false} 
          className="ml-2" 
        />
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Duplicar
        </Button>
        <Button onClick={() => onEdit(checklist.id)} size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete(checklist.id, checklist.title)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
