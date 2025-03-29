import { Checklist } from "@/types/checklist";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, User, FileText } from "lucide-react";
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
  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
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

  const filteredChecklists = checklists.filter(
    checklist => checklist.category !== 'sub-checklist'
  );

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredChecklists.map((checklist) => (
            <ChecklistRow
              key={checklist.id}
              checklist={checklist}
              onOpenChecklist={onOpenChecklist}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ChecklistRow({
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
    <TableRow
      className="cursor-pointer hover:bg-accent/50"
      onClick={() => onOpenChecklist(checklist.id)}
    >
      <TableCell className="font-medium">
        {checklist.title}
      </TableCell>
      <TableCell>
        {checklist.is_template ? (
          <Badge variant="secondary">Template</Badge>
        ) : (
          <Badge variant={checklist.status_checklist === "ativo" ? "default" : "outline"}>
            {checklist.status_checklist === "ativo" ? "Ativo" : "Inativo"}
          </Badge>
        )}
      </TableCell>
      <TableCell>{checklist.category || "-"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{checklist.responsible_name || "Não atribuído"}</span>
        </div>
      </TableCell>
      <TableCell>
        {format(new Date(checklist.created_at), "dd MMM yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onOpenChecklist(checklist.id);
            }}>
              Abrir Checklist
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canDelete && (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(checklist.id, checklist.title);
                }}
              >
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
