
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Clipboard, MoreHorizontal } from "lucide-react";
import { Checklist } from "@/types/checklist";

interface ChecklistsListProps {
  checklists: Checklist[];
  isLoading: boolean;
  onOpenChecklist: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function ChecklistsList({ 
  checklists, 
  isLoading, 
  onOpenChecklist, 
  onDelete 
}: ChecklistsListProps) {
  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
        <div className="col-span-2">Nome</div>
        <div className="hidden md:block">Responsável</div>
        <div className="hidden md:block">Data</div>
        <div className="text-right">Ações</div>
      </div>
      <ScrollArea className="h-[calc(100vh-340px)]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 p-4 items-center border-b">
              <div className="col-span-2">
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="hidden md:block">
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="hidden md:block">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-9 w-16 mr-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          ))
        ) : checklists.length === 0 ? (
          <div className="text-center py-10">
            <Clipboard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum checklist encontrado</h3>
            <p className="text-muted-foreground">
              Crie um novo checklist ou ajuste os filtros de busca.
            </p>
          </div>
        ) : (
          checklists.map((checklist) => (
            <div key={checklist.id} className="grid grid-cols-5 gap-4 p-4 items-center border-b">
              <div className="col-span-2">
                <div className="font-medium">{checklist.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {checklist.items} itens
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
              </div>
              <div className="hidden md:block text-sm">
                {checklist.responsible_name || "Não atribuído"}
              </div>
              <div className="hidden md:block text-sm">
                {new Date(checklist.created_at).toLocaleDateString()}
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onOpenChecklist(checklist.id)}
                >
                  Editar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
                    <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(checklist.id, checklist.title)}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
