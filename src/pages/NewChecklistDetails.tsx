
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  PlayCircle, 
  Power, 
  PowerOff,
  FileText,
  CheckCheck,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChecklistProgressBar } from "@/components/new-checklist/ChecklistProgressBar";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { formatDate } from "@/utils/format";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useChecklistMutations } from "@/hooks/new-checklist/useChecklistMutations";

export default function NewChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const { checklist, loading, error, refetch } = useChecklistById(id || "");
  const { deleteChecklist, updateStatus } = useChecklistMutations();
  
  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar checklist");
      navigate("/new-checklists");
    }
  }, [error, navigate]);
  
  const handleStatusToggle = async () => {
    if (!checklist || isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const newStatus = checklist.status === "active" ? "inactive" : "active";
      await updateStatus(checklist.id, newStatus);
      toast.success(
        newStatus === "active" 
          ? "Checklist ativado com sucesso" 
          : "Checklist desativado com sucesso"
      );
      refetch();
    } catch (error) {
      console.error("Error updating checklist status:", error);
      toast.error("Erro ao alterar status do checklist");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  const handleDeleteChecklist = async () => {
    if (!checklist) return;
    
    try {
      await deleteChecklist(checklist.id);
      toast.success("Checklist excluído com sucesso");
      navigate("/new-checklists");
    } catch (error) {
      console.error("Error deleting checklist:", error);
      toast.error("Erro ao excluir checklist");
    }
  };
  
  const handleNewInspection = () => {
    if (!checklist) return;
    navigate(`/inspections/new/${checklist.id}`);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando checklist...</p>
        </div>
      </div>
    );
  }
  
  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Checklist não encontrado</h2>
        <p className="text-muted-foreground mb-6">
          O checklist solicitado não existe ou foi removido.
        </p>
        <Button onClick={() => navigate("/new-checklists")}>
          Voltar para Checklists
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/new-checklists")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Checklist</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleStatusToggle}
            disabled={isUpdatingStatus}
          >
            {checklist.status === "active" ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                <span>Desativar</span>
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                <span>Ativar</span>
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(`/new-checklists/edit/${checklist.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Excluir</span>
          </Button>
          
          {checklist.status === "active" && !checklist.is_template && (
            <Button onClick={handleNewInspection}>
              <PlayCircle className="mr-2 h-4 w-4" />
              <span>Iniciar Inspeção</span>
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{checklist.title}</CardTitle>
              {checklist.description && (
                <CardDescription className="mt-2">
                  {checklist.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {checklist.is_template && (
                <Badge variant="secondary">Template</Badge>
              )}
              
              <Badge
                variant="outline"
                className={
                  checklist.status === "active"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-red-50 text-red-500 border-red-200"
                }
              >
                {checklist.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              
              {checklist.category && (
                <Badge variant="outline">{checklist.category}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Informações Gerais</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Empresa:</dt>
                  <dd className="font-medium">
                    {checklist.companyName || "Não atribuído"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Categoria:</dt>
                  <dd className="font-medium">
                    {checklist.category || "Não categorizado"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Responsável:</dt>
                  <dd className="font-medium">
                    {checklist.responsibleName || "Não atribuído"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Data de vencimento:</dt>
                  <dd className="font-medium">
                    {checklist.due_date ? formatDate(checklist.due_date) : "Sem vencimento"}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Estatísticas</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total de perguntas:</dt>
                  <dd className="font-medium">{checklist.totalQuestions}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Criado em:</dt>
                  <dd className="font-medium">
                    {checklist.created_at ? formatDate(checklist.created_at) : "-"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Atualizado em:</dt>
                  <dd className="font-medium">
                    {checklist.updated_at ? formatDate(checklist.updated_at) : "-"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Progresso:</dt>
                  <dd className="font-medium">
                    {checklist.completedQuestions || 0}/{checklist.totalQuestions}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <ChecklistProgressBar
            totalQuestions={checklist.totalQuestions}
            completedQuestions={checklist.completedQuestions || 0}
          />
          
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Visão Geral</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Histórico</span>
                </TabsTrigger>
                <TabsTrigger value="inspections" className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4" />
                  <span>Inspeções</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <p className="text-muted-foreground">
                  Visualize e gerencie todos os detalhes do checklist. Para editar o checklist ou adicionar perguntas,
                  clique no botão "Editar" acima. Para executar uma inspeção com este checklist, clique em "Iniciar Inspeção".
                </p>
                
                {checklist.totalQuestions === 0 && (
                  <div className="border border-dashed rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma pergunta adicionada</h3>
                    <p className="text-muted-foreground mb-4">
                      Este checklist não possui perguntas. Adicione perguntas para começar a usá-lo em inspeções.
                    </p>
                    <Button onClick={() => navigate(`/new-checklists/edit/${checklist.id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Adicionar Perguntas
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <p className="text-muted-foreground">
                  O histórico de alterações deste checklist estará disponível em breve.
                </p>
              </TabsContent>
              
              <TabsContent value="inspections" className="space-y-4">
                <p className="text-muted-foreground">
                  A lista de inspeções realizadas com este checklist estará disponível em breve.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <DeleteChecklistDialog
        checklistId={checklist.id}
        checklistTitle={checklist.title}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleted={handleDeleteChecklist}
        isDeleting={false}
      />
    </div>
  );
}
