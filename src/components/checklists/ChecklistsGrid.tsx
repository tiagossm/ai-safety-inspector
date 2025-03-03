
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, MoreHorizontal, User, Users, Clipboard } from "lucide-react";
import { Checklist } from "@/types/checklist";

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
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="flex-grow">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
              <div className="mt-4">
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="text-center py-10">
        <Clipboard className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground">
          Crie um novo checklist ou ajuste os filtros de busca.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {checklists.map((checklist) => (
        <Card key={checklist.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-medium">
                {checklist.title}
              </CardTitle>
              <div className="flex flex-wrap gap-1 mt-1">
                {checklist.is_template && (
                  <Badge variant="secondary">Template</Badge>
                )}
                {checklist.category && (
                  <Badge variant="outline">
                    {checklist.category.charAt(0).toUpperCase() + checklist.category.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpenChecklist(checklist.id)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Compartilhar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(checklist.id, checklist.title)}
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {checklist.description || "Sem descrição"}
            </p>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Check className="mr-1 h-4 w-4" />
              <span>{checklist.items} itens</span>
            </div>
            {checklist.responsible_name && (
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <User className="mr-1 h-4 w-4" />
                <span>{checklist.responsible_name}</span>
              </div>
            )}
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Colaboradores:</p>
              <div className="flex -space-x-2">
                {checklist.collaborators?.map((user) => (
                  <Avatar key={user.id} className="h-7 w-7 border-2 border-background">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                ))}
                {checklist.collaborators && checklist.collaborators.length > 0 && (
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-full">
                    <Users className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => onOpenChecklist(checklist.id)}
            >
              Abrir Checklist
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
