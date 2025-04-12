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
  ExternalLink
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

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export function ChecklistCard({
  checklist,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  isSelected = false,
  onSelect
}: ChecklistCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  
  const isActive = checklist.status === "active";
  const originValue = checklist.origin as "manual" | "ia" | "csv" | undefined;

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);
    
    try {
      const newStatus = isActive ? "inactive" : "active";
      // const { error } = await supabase
      //   .from("checklists")
      //   .update({ status_checklist: newStatus === "active" ? "ativo" : "inativo" })
      //   .eq("id", checklist.id);
        
      // if (error) throw error;
      
      // toast({
      //   title: "Status atualizado",
      //   description: `O checklist foi ${newStatus === "active" ? "ativado" : "desativado"}.`,
      // });
      
      onStatusChange();
    } catch (error) {
      console.error("Error toggling status:", error);
      // toast({
      //   variant: "destructive",
      //   title: "Erro",
      //   description: "Não foi possível alterar o status do checklist.",
      // });
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
        <Button 
          onClick={handleOpen} 
          variant="ghost" 
          className="ml-auto gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Abrir</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
