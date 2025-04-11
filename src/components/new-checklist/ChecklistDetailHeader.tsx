
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ChecklistDetailHeaderProps {
  title: string;
  isTemplate: boolean;
  status: string;
  origin?: string;
  id: string;
  onDelete: (id: string, title: string) => void;
}

export function ChecklistDetailHeader({
  title,
  isTemplate,
  status,
  origin,
  id,
  onDelete
}: ChecklistDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/checklists')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="default"
          onClick={() => navigate(`/inspections/new?checklist=${id}`)}
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          Iniciar Inspeção
        </Button>
        <Button variant="outline" onClick={() => navigate(`/new-checklists/${id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => onDelete(id, title)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
