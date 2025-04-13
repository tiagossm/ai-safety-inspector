import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ChecklistWithStats } from "@/types/newChecklist";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { Badge } from "@/components/ui/badge";
import { ChecklistOriginBadge } from "@/components/new-checklist/ChecklistOriginBadge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/utils/format";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { 
  MoreHorizontal, 
  Pencil, 
  Copy, 
  Trash2, 
  ArrowLeft 
} from "lucide-react";

export default function NewChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklistToDelete, setChecklistToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const {
    data: checklist,
    isLoading,
    error,
  } = useChecklistById(id as string);

  const handleEditChecklist = (id: string) => {
    navigate(`/new-checklists/${id}/edit`);
  };

  const handleDeleteChecklist = async (id: string, title: string) => {
    setChecklistToDelete({ id, title });
  };

  const confirmDeleteChecklist = async () => {
    if (!checklistToDelete) return;

    setIsDeleting(true);
    try {
      // Simulate delete operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Checklist excluído com sucesso!",
        description: `O checklist "${checklistToDelete.title}" foi excluído.`,
      });
      navigate("/new-checklists");
    } finally {
      setIsDeleting(false);
      setChecklistToDelete(null);
    }
  };

  if (isLoading) {
    return <div>Carregando detalhes do checklist...</div>;
  }

  if (error) {
    return <div>Erro ao carregar checklist: {error.toString()}</div>;
  }

  if (!checklist) {
    return <div>Checklist não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/new-checklists")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{checklist.title}</h1>
          <ChecklistOriginBadge origin="manual" showLabel={false} className="ml-2" />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          <Button onClick={() => handleEditChecklist(checklist.id)} size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteChecklist(checklist.id, checklist.title)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Checklist</CardTitle>
          <CardDescription>Detalhes e configurações do checklist.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Título</h4>
                <p className="text-muted-foreground">{checklist.title}</p>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium">Descrição</h4>
                <p className="text-muted-foreground">{checklist.description || "Nenhuma descrição fornecida."}</p>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium">Categoria</h4>
                <p className="text-muted-foreground">{checklist.category}</p>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Status</h4>
                <Badge variant={checklist.status === "active" ? "default" : "secondary"}>
                  {checklist.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium">Criado em</h4>
                <p className="text-muted-foreground">{formatDate(checklist.createdAt)}</p>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium">Atualizado em</h4>
                <p className="text-muted-foreground">{formatDate(checklist.updatedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas do Checklist</CardTitle>
          <CardDescription>Lista de perguntas incluídas neste checklist.</CardDescription>
        </CardHeader>
        <CardContent>
          {checklist.questions && checklist.questions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Ordem</TableHead>
                  <TableHead>Pergunta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Obrigatório</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklist.questions.map((question, index) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{question.text}</TableCell>
                    <TableCell>{question.responseType}</TableCell>
                    <TableCell className="text-right">{question.isRequired ? "Sim" : "Não"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Nenhuma pergunta encontrada para este checklist.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteChecklistDialog
        checklistId={checklistToDelete?.id || ""}
        checklistTitle={checklistToDelete?.title || ""}
        isOpen={!!checklistToDelete}
        onOpenChange={(open: boolean) =>
          open ? null : setChecklistToDelete(null)
        }
        onDeleted={confirmDeleteChecklist}
        isDeleting={isDeleting}
      />
    </div>
  );
}
