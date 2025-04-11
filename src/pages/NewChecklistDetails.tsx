
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { ChecklistItem } from "@/components/new-checklist/ChecklistItem";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NewChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: checklist, loading, refetch } = useChecklistById(id || "");
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; checklistId: string; checklistTitle: string }>({
    isOpen: false,
    checklistId: "",
    checklistTitle: ""
  });

  const handleDelete = (checklistId: string, checklistTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      checklistId,
      checklistTitle
    });
  };

  const handleDeleteConfirmed = async () => {
    try {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', deleteDialog.checklistId);
      
      if (error) throw error;
      
      toast.success('Checklist excluído com sucesso');
      navigate('/checklists');
    } catch (error) {
      console.error('Error deleting checklist:', error);
      toast.error('Erro ao excluir checklist');
    } finally {
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não definida';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div>
                <p className="text-sm text-gray-500">Empresa</p>
                <Skeleton className="h-6 w-40 mt-1" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Categoria</p>
                <Skeleton className="h-6 w-32 mt-1" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Responsável</p>
                <Skeleton className="h-6 w-36 mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Skeleton className="h-6 w-24 mt-1" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Criado em</p>
                <Skeleton className="h-6 w-32 mt-1" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de vencimento</p>
                <Skeleton className="h-6 w-32 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-medium">Questões do Checklist</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <h2 className="text-2xl font-bold text-gray-700">Checklist não encontrado</h2>
        <p className="text-gray-500 mt-2">O checklist solicitado não existe ou foi removido.</p>
        <Button className="mt-6" onClick={() => navigate('/checklists')}>
          Voltar para Checklists
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/checklists')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{checklist.title}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={checklist.isTemplate ? "outline" : "default"}>
                {checklist.isTemplate ? "Template" : "Checklist"}
              </Badge>
              <Badge variant="secondary">{checklist.status}</Badge>
              {checklist.origin && (
                <Badge variant="outline" className="capitalize">
                  {checklist.origin}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/new-checklists/${checklist.id}/edit`)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(checklist.id, checklist.title)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>

          {checklist.description && (
            <p className="text-gray-600 mt-2">{checklist.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div>
              <p className="text-sm text-gray-500">Empresa</p>
              <p className="font-medium">{checklist.companyName || "Não definido"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Categoria</p>
              <p className="font-medium">{checklist.category || "Não definido"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Responsável</p>
              <p className="font-medium">{checklist.responsibleName || "Não definido"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{checklist.status || "Não definido"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Criado em</p>
              <p className="font-medium">{formatDate(checklist.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data de vencimento</p>
              <p className="font-medium">{checklist.dueDate ? formatDate(checklist.dueDate) : "Não definido"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Questões do Checklist</h2>
        {checklist.questions && checklist.questions.length > 0 ? (
          <div className="space-y-3">
            {checklist.questions.map((question, index) => (
              <ChecklistItem 
                key={question.id}
                title={question.text}
                type={question.responseType}
                required={question.isRequired}
                order={index + 1}
                hasSubchecklist={question.hasSubchecklist}
                options={question.options}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Este checklist não possui questões.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <DeleteChecklistDialog
        checklistId={deleteDialog.checklistId}
        checklistTitle={deleteDialog.checklistTitle}
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}
        onDeleted={handleDeleteConfirmed}
      />
    </div>
  );
}
