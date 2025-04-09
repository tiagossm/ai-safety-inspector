import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, PlayCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { useChecklistDelete } from "@/hooks/new-checklist/useChecklistDelete";
import { ChecklistOriginBadge } from "@/components/new-checklist/ChecklistOriginBadge";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";

export default function NewChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useChecklistById(id || "");
  const [checklist, setChecklist] = useState<ChecklistWithStats | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteChecklist = useChecklistDelete();
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (data) {
      setChecklist(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar checklist", {
        description: "Verifique se o ID é válido ou tente novamente mais tarde."
      });
      navigate("/new-checklists");
    }
  }, [error, navigate]);

  const handleEdit = () => {
    if (id) {
      navigate(`/new-checklists/edit/${id}`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deleteChecklist.mutateAsync(id);
      toast.success("Checklist excluído com sucesso");
      navigate("/new-checklists");
    } catch (error) {
      console.error("Error deleting checklist:", error);
      toast.error("Erro ao excluir checklist");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleStartInspection = () => {
    if (id) {
      navigate(`/inspections/new?checklist=${id}`);
    }
  };

  const handleDuplicate = () => {
    if (checklist) {
      navigate("/new-checklists/create", { 
        state: { 
          duplicateFrom: checklist 
        } 
      });
    }
  };

  if (isLoading || !checklist) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => navigate("/new-checklists")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Checklist</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDuplicate}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          
          <Button
            onClick={handleStartInspection}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Iniciar Inspeção
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ChecklistOriginBadge origin={checklist.origin} />
                <Badge variant={checklist.isTemplate ? "secondary" : "default"}>
                  {checklist.isTemplate ? "Template" : checklist.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
                {checklist.category && (
                  <Badge variant="outline">{checklist.category}</Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold">{checklist.title}</h2>
              {checklist.description && (
                <p className="text-muted-foreground mt-2">{checklist.description}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Informações</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Criado em</p>
                    <p className="font-medium">
                      {checklist.createdAt ? format(new Date(checklist.createdAt), "PPP", { locale: ptBR }) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Última atualização</p>
                    <p className="font-medium">
                      {checklist.updatedAt ? format(new Date(checklist.updatedAt), "PPP", { locale: ptBR }) : "N/A"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-medium">{checklist.companyName || "Não especificada"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Responsável</p>
                  <p className="font-medium">{checklist.responsibleName || "Não especificado"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Total de perguntas</p>
                  <p className="font-medium">{checklist.totalQuestions}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Perguntas</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {checklist.questions && checklist.questions.length > 0 ? (
                  checklist.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <p className="font-medium">
                          {index + 1}. {question.text}
                        </p>
                        <Badge variant="outline" className="ml-2">
                          {question.responseType === "yes_no" ? "Sim/Não" : 
                           question.responseType === "multiple_choice" ? "Múltipla escolha" :
                           question.responseType === "text" ? "Texto" :
                           question.responseType === "numeric" ? "Numérico" :
                           question.responseType === "photo" ? "Foto" :
                           question.responseType === "signature" ? "Assinatura" : 
                           question.responseType}
                        </Badge>
                      </div>
                      
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">Opções:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {question.options.map((option, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {question.hint && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium">Dica:</span> {question.hint}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Nenhuma pergunta cadastrada</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DeleteChecklistDialog
        checklistId={id || ""}
        checklistTitle={checklist.title}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handleDelete}
        isDeleting={isDeleting}
      />
      
      <FloatingNavigation threshold={400} />
    </div>
  );
}
