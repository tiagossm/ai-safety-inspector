
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Pencil, Trash2, PlayCircle } from "lucide-react";
import { ChecklistOriginBadge } from "@/components/new-checklist/ChecklistOriginBadge";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  const handleStartInspection = () => {
    // Navigate to new inspection page with checklist ID
    navigate(`/inspections/new?checklistId=${checklist.id}`);
  };
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/new-checklists")}
                aria-label="Voltar para lista de checklists"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voltar para lista</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <h1 className="text-2xl font-bold" id="checklist-title">
          {checklist.title}
        </h1>
        <ChecklistOriginBadge 
          origin={checklist.origin as "manual" | "ia" | "csv" | undefined} 
          showLabel={false} 
          className="ml-2" 
        />
      </div>
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                <span>Duplicar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Criar uma cópia deste checklist</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleStartInspection} 
                className="bg-green-600 hover:bg-green-700"
                aria-label={`Iniciar inspeção para ${checklist.title}`}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                <span>Iniciar Inspeção</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Iniciar uma nova inspeção com este checklist</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => onEdit(checklist.id)} 
                size="sm"
                aria-label={`Editar checklist ${checklist.title}`}
              >
                <Pencil className="h-4 w-4 mr-2" />
                <span>Editar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar este checklist</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDelete(checklist.id, checklist.title)}
                aria-label={`Excluir checklist ${checklist.title}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Excluir</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir permanentemente este checklist</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
