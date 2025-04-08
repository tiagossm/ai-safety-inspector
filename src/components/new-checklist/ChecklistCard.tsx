
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Edit, Trash2, MoreVertical, CheckSquare, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/format";
import { Progress } from "@/components/ui/progress";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
}

export const ChecklistCard = ({
  checklist,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
}: ChecklistCardProps) => {
  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const newStatus = checklist.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await fetch(`/api/checklists/${checklist.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).then(res => res.json());
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error toggling checklist status:", error);
    }
  };

  // Calculate progress if we have the data
  const progress = checklist.totalQuestions && checklist.completedQuestions
    ? Math.round((checklist.completedQuestions / checklist.totalQuestions) * 100)
    : 0;

  return (
    <Card 
      className="h-full flex flex-col"
      onClick={() => onOpen(checklist.id)}
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div className="flex gap-2 mb-2">
            <Badge variant={checklist.isTemplate ? "secondary" : "default"}>
              {checklist.isTemplate ? "Template" : checklist.status === 'active' ? "Ativo" : "Inativo"}
            </Badge>
            <ChecklistOriginBadge origin={checklist.origin} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(checklist.id);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                toggleStatus(e);
              }}>
                {checklist.status === 'active' ? (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    <span>Desativar</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <span>Ativar</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(checklist.id, checklist.title);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="text-lg font-medium line-clamp-2 mb-1">{checklist.title}</h3>
        
        {checklist.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {checklist.description}
          </p>
        )}
        
        <div className="mt-auto">
          {checklist.category && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs font-normal">
                {checklist.category}
              </Badge>
            </div>
          )}
          
          {checklist.totalQuestions > 0 && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span>{checklist.completedQuestions || 0} de {checklist.totalQuestions} itens</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-3">
            Criado em {formatDate(checklist.createdAt || checklist.created_at || "")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
