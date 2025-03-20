
import React from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
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
import { Edit2, Trash2, FileCheck } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ChecklistListProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen?: (id: string) => void;
}

export function ChecklistList({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen
}: ChecklistListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (checklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold mb-2">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground max-w-md">
          Não foi encontrado nenhum checklist com os filtros atuais. Tente ajustar os filtros ou criar um novo checklist.
        </p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Perguntas</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checklists.map((checklist) => (
            <TableRow key={checklist.id}>
              <TableCell className="font-medium">
                {checklist.title}
                {checklist.isTemplate && (
                  <Badge variant="outline" className="ml-2 bg-blue-50">
                    Template
                  </Badge>
                )}
              </TableCell>
              <TableCell>{checklist.category || "Geral"}</TableCell>
              <TableCell>
                <Badge variant={checklist.status === "active" ? "default" : "secondary"}>
                  {checklist.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {checklist.totalQuestions || 0}
              </TableCell>
              <TableCell>
                {checklist.createdAt 
                  ? new Date(checklist.createdAt).toLocaleDateString() 
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(checklist.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(checklist.id, checklist.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                  
                  {onOpen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpen(checklist.id)}
                    >
                      <FileCheck className="h-4 w-4" />
                      <span className="sr-only">Abrir</span>
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
