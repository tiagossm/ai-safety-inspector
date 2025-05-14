
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, ClipboardCheck, Briefcase, Calendar, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDeleteChecklist } from "@/hooks/checklist/useDeleteChecklist";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ChecklistCardProps {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  statusChecklist?: string;
  isTemplate?: boolean;
  dueDate?: string | null;
  companyName?: string | null;
  completedItems?: number;
  totalItems?: number;
  onDelete?: () => void;
}

export function ChecklistCard({
  id,
  title,
  description,
  status = "pendente",
  statusChecklist = "ativo",
  isTemplate = false,
  dueDate,
  companyName,
  completedItems = 0,
  totalItems = 0,
  onDelete
}: ChecklistCardProps) {
  const navigate = useNavigate();
  const deleteChecklist = useDeleteChecklist();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
      await deleteChecklist.mutateAsync(id);
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting checklist:", error);
    }
  };
  
  const getStatusColor = () => {
    if (statusChecklist === "inativo") return "text-gray-500";
    
    switch (status) {
      case "concluido": return "text-green-500";
      case "em_andamento": return "text-amber-500";
      default: return "text-blue-500";
    }
  };
  
  const getStatusText = () => {
    if (statusChecklist === "inativo") return "Inativo";
    
    switch (status) {
      case "concluido": return "Concluído";
      case "em_andamento": return "Em andamento";
      default: return "Pendente";
    }
  };
  
  const goToDetail = () => {
    navigate(`/checklists/${id}`);
  };

  const startInspection = () => {
    navigate(`/inspections/new/${id}`);
  };
  
  return (
    <Card className={cn(
      "transition-shadow hover:shadow-md",
      statusChecklist === "inativo" && "opacity-70"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate" title={title}>{title}</CardTitle>
          <Badge 
            variant={isTemplate ? "outline" : "secondary"} 
            className={cn(
              isTemplate ? "border-purple-300 text-purple-700" : "bg-blue-100 text-blue-800",
              "text-xs"
            )}
          >
            {isTemplate ? "Template" : "Checklist"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {description || "Sem descrição"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex justify-between">
            <span className={cn("font-medium flex items-center gap-1", getStatusColor())}>
              <ClipboardCheck className="h-3.5 w-3.5" />
              {getStatusText()}
            </span>
            {totalItems > 0 && (
              <span className="text-gray-500">
                {completedItems}/{totalItems} itens
              </span>
            )}
          </div>
          
          {companyName && (
            <div className="flex items-center gap-1 truncate">
              <Briefcase className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-500 truncate" title={companyName}>
                {companyName}
              </span>
            </div>
          )}
          
          {dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-500">
                {format(new Date(dueDate), "d 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end">
        <div className="flex gap-2">
          {statusChecklist === "ativo" && !isTemplate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={startInspection} className="text-green-600">
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Iniciar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Iniciar uma inspeção</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={goToDetail}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visualizar checklist</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => alert('Editando')} className="text-blue-600">
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar checklist</p>
              </TooltipContent>
            </Tooltip>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Excluir checklist</p>
                  </TooltipContent>
                </Tooltip>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este checklist? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
}
