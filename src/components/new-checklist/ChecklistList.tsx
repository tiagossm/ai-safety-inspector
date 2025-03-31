
import React from "react";
import { Link } from "react-router-dom";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash, Copy, ClipboardCheck, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ChecklistListProps {
  checklists: ChecklistWithStats[];
  isLoading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, title: string) => void;
  onDuplicate?: (id: string) => void;
  onOpen?: (id: string) => void;
}

export function ChecklistList({ 
  checklists, 
  isLoading, 
  onEdit, 
  onDelete,
  onDuplicate,
  onOpen 
}: ChecklistListProps) {
  // Filter out sub-checklists from display
  const filteredChecklists = checklists.filter(
    checklist => !(checklist.isSubChecklist || checklist.is_sub_checklist)
  );
  
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-9 w-20 bg-gray-200 animate-pulse rounded float-right"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (filteredChecklists.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <PlusCircle className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Nenhuma lista encontrada</h3>
        <p className="mt-2 text-sm text-muted-foreground mb-4">
          Crie sua primeira lista de verificação
        </p>
        <Button asChild>
          <Link to="/new-checklists/create">Criar Lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredChecklists.map((checklist) => (
            <TableRow key={checklist.id}>
              <TableCell className="font-medium">
                <Link
                  to={`/new-checklists/${checklist.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {checklist.title}
                </Link>
              </TableCell>
              <TableCell>
                {checklist.category ? (
                  <Badge variant="outline">{checklist.category}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Não definida</span>
                )}
              </TableCell>
              <TableCell>
                {checklist.status === "active" ? (
                  <Badge variant="success" className="bg-green-100 text-green-800">
                    <ClipboardCheck className="mr-1 h-3 w-3" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    <Ban className="mr-1 h-3 w-3" />
                    Inativo
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(checklist.createdAt || checklist.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      title="Editar"
                    >
                      <Link to={`/new-checklists/edit/${checklist.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  
                  {onDuplicate && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDuplicate(checklist.id)}
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(checklist.id, checklist.title)}
                      title="Excluir"
                      className="text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
