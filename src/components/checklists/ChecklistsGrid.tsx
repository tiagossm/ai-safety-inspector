
import { Checklist } from "@/types/checklist";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, FileText, Trash2, Calendar, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useChecklistPermissions } from "@/hooks/checklist/useChecklistPermissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChecklistsGridProps {
  checklists: Checklist[];
  isLoading: boolean;
  onOpenChecklist: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function ChecklistsGrid({
  checklists,
  isLoading,
  onOpenChecklist,
  onDelete
}: ChecklistsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground mb-6">
          Crie seu primeiro checklist para começar ou ajuste os filtros de busca.
        </p>
        <Button asChild>
          <a href="/checklists/create">Criar Checklist</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {checklists.map((checklist) => (
        <ChecklistCard
          key={checklist.id}
          checklist={checklist}
          onOpenChecklist={onOpenChecklist}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function ChecklistCard({
  checklist,
  onOpenChecklist,
  onDelete
}: {
  checklist: Checklist;
  onOpenChecklist: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}) {
  const { data: permissions } = useChecklistPermissions(checklist.id);
  const canDelete = permissions?.delete || false;
  
  return (
    <Card className="overflow-hidden hover:shadow transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={checklist.is_template ? "secondary" : checklist.status_checklist === "ativo" ? "default" : "outline"}>
            {checklist.is_template ? "Template" : checklist.status_checklist === "ativo" ? "Ativo" : "Inativo"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpenChecklist(checklist.id)}>
                Abrir Checklist
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(checklist.id, checklist.title)}
                >
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle 
          className="text-md line-clamp-2 cursor-pointer hover:text-primary"
          onClick={() => onOpenChecklist(checklist.id)}
        >
          {checklist.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        {checklist.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {checklist.description}
          </p>
        )}
        
        <div className="flex flex-col gap-2 mt-2">
          {checklist.category && (
            <Badge variant="outline" className="w-fit">
              {checklist.category}
            </Badge>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(checklist.created_at), "dd MMM yyyy", { locale: ptBR })}
          </div>
          
          {checklist.items && (
            <div className="text-sm text-muted-foreground">
              {checklist.items} {checklist.items === 1 ? "item" : "itens"}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between items-center">
        {checklist.collaborators && checklist.collaborators.length > 0 ? (
          <div className="flex -space-x-2">
            {checklist.collaborators.map((collaborator, index) => (
              <Avatar key={index} className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {collaborator.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        ) : (
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            Sem colaboradores
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onOpenChecklist(checklist.id)}
        >
          Abrir
        </Button>
      </CardFooter>
    </Card>
  );
}
