
import React, { useState } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  File, 
  Pencil,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  PlayCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { formatDate } from "@/utils/format";
import { useNavigate } from "react-router-dom";

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onUpdateStatus: (params: { checklistId: string; newStatus: "active" | "inactive" }) => Promise<void>;
  // onStatusChange is kept in props if other actions in card might need a generic refetch,
  // but it's removed from handleToggleStatus. If not used elsewhere, it can be fully removed.
  onStatusChange?: () => void; 
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export function ChecklistCard({
  checklist,
  onEdit,
  onDelete,
  onOpen,
  onUpdateStatus,
  // onStatusChange, // No longer directly used by handleToggleStatus
  isSelected = false,
  onSelect
}: ChecklistCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();
  
  const isActive = checklist.status === "active";
  const originValue = checklist.origin as "manual" | "ia" | "csv" | undefined;

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);
    
    try {
      const newStatus = isActive ? "inactive" : "active";
      await onUpdateStatus({ checklistId: checklist.id, newStatus });
      // The mutation itself (via useChecklistMutations) handles success/error toasts and query invalidation (refetch).
    } catch (error) {
      // Error is already handled by useChecklistMutations (logs and toasts)
      // If specific error handling for this component is needed, add it here.
      console.error("Error toggling status in ChecklistCard:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(checklist.id, checklist.title);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(checklist.id);
  };
  
  const handleOpen = () => {
    onOpen(checklist.id);
  };

  const handleStartInspection = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/inspections/new/${checklist.id}`);
  };

  return (
    <Card className="overflow-hidden relative hover:shadow-md transition-all">
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-2 items-center ml-6">
            {originValue && (
              <ChecklistOriginBadge origin={originValue} showLabel={false} />
            )}
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={(e) => handleOpen()}>
                <File className="mr-2 h-4 w-4" />
                <span>Abrir</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleEdit(e)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              {isActive && (
                <DropdownMenuItem onClick={handleStartInspection}>
                  <PlayCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Iniciar Inspeção</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => handleToggleStatus(e)} disabled={isToggling}>
                {isActive ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Desativar</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Ativar</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={(e) => handleDelete(e)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div 
          onClick={handleOpen}
          className="mt-2 font-medium cursor-pointer hover:text-primary transition-colors"
        >
          {checklist.title}
        </div>
        {checklist.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {checklist.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              {checklist.category || "Sem categoria"}
            </span>
            <span className="text-muted-foreground">
              Criado: {formatDate(checklist.createdAt || "")}
            </span>
          </div>
          
          {checklist.companyName && (
            <span className="text-muted-foreground truncate">
              {checklist.companyName}
            </span>
          )}
          
          {checklist.createdByName && (
            <span className="text-muted-foreground">
              Por: {checklist.createdByName}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex gap-2 ml-auto">
          {isActive && (
            <Button 
              onClick={handleStartInspection}
              variant="outline" 
              className="gap-2"
            >
              <PlayCircle className="h-4 w-4 text-green-500" />
              <span>Iniciar Inspeção</span>
            </Button>
          )}
          <Button 
            onClick={handleOpen} 
            variant="ghost" 
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Abrir</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
