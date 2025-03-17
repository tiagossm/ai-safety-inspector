import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checklist, ChecklistItem, ChecklistComment, ChecklistAttachment, ChecklistHistory } from "@/types/checklist";
import { useChecklistDetails } from "@/hooks/checklist/useChecklistDetails";
import { useUpdateChecklistItem } from "@/hooks/checklist/useUpdateChecklistItem";
import { useDeleteChecklistItem } from "@/hooks/checklist/useDeleteChecklistItem";
import { useAddChecklistItem } from "@/hooks/checklist/useAddChecklistItem";
import { useSaveChecklist } from "@/hooks/checklist/useSaveChecklist";
import ChecklistHeader from "@/components/checklists/ChecklistHeader";
import ChecklistForm from "@/components/checklists/ChecklistForm";
import ChecklistItemsList from "@/components/checklists/ChecklistItemsList";
import AddChecklistItemForm from "@/components/checklists/AddChecklistItemForm";
import { ChecklistComments } from "@/components/checklists/ChecklistComments";
import { ChecklistAttachments } from "@/components/checklists/ChecklistAttachments";
import { ChecklistHistoryLog } from "@/components/checklists/ChecklistHistory";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, MessageSquare, Paperclip, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const questionTypes = [
  { value: "sim/não", label: "Sim/Não" },
  { value: "numérico", label: "Resposta Numérica" },
  { value: "texto", label: "Resposta em Texto" },
  { value: "foto", label: "Foto" },
  { value: "assinatura", label: "Assinatura" },
  { value: "seleção múltipla", label: "Seleção Múltipla" }
];

interface ChecklistDetailsContainerProps {
  checklistId: string;
}

export default function ChecklistDetailsContainer({ checklistId }: ChecklistDetailsContainerProps) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  const [comments, setComments] = useState<ChecklistComment[]>([]);
  const [attachments, setAttachments] = useState<ChecklistAttachment[]>([]);
  const [history, setHistory] = useState<ChecklistHistory[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);
  
  const {
    checklist,
    setChecklist,
    items,
    setItems,
    users,
    isLoading,
    error
  } = useChecklistDetails(checklistId);

  const updateItemMutation = useUpdateChecklistItem();
  const deleteItemMutation = useDeleteChecklistItem();
  const addItemMutation = useAddChecklistItem(checklistId);
  const saveChecklistMutation = useSaveChecklist(checklistId);

  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar checklist:", error);
      setNotFound(true);
    }
  }, [error]);

  useEffect(() => {
    console.log("ChecklistDetailsContainer rendered with ID:", checklistId);
    console.log("Items loaded:", items?.length || 0);
  }, [checklistId, items]);

  useEffect(() => {
    if (notFound) {
      toast.error("Checklist não encontrado ou acesso negado.");
      navigate("/checklists");
    }
  }, [notFound, navigate]);
  
  useEffect(() => {
    const loadExtraData = async () => {
      if (!checklistId || !activeTab || activeTab === 'items') return;
      
      setLoadingExtra(true);
      try {
        if (activeTab === 'comments') {
          const { data: commentsData, error: commentsError } = await supabase
            .from('checklist_comments')
            .select(`*`)
            .eq('checklist_id', checklistId)
            .order('created_at', { ascending: false });
            
          if (commentsError) throw commentsError;
          
          const commentsWithNames = await Promise.all(commentsData.map(async (comment) => {
            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', comment.user_id)
              .single();
              
            return {
              id: comment.id,
              checklist_id: comment.checklist_id,
              user_id: comment.user_id,
              user_name: userData?.name || 'Usuário',
              content: comment.content,
              created_at: comment.created_at
            };
          }));
          
          setComments(commentsWithNames);
        }
        
        if (activeTab === 'attachments') {
          const { data: attachmentsData, error: attachmentsError } = await supabase
            .from('checklist_attachments')
            .select(`*`)
            .eq('checklist_id', checklistId)
            .order('created_at', { ascending: false });
            
          if (attachmentsError) throw attachmentsError;
          
          const attachmentsWithNames = await Promise.all(attachmentsData.map(async (attachment) => {
            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', attachment.uploaded_by)
              .single();
              
            return {
              id: attachment.id,
              checklist_id: attachment.checklist_id,
              file_name: attachment.file_name,
              file_url: attachment.file_url,
              file_type: attachment.file_type,
              uploaded_by: userData?.name || 'Usuário',
              created_at: attachment.created_at
            };
          }));
          
          setAttachments(attachmentsWithNames);
        }
        
        if (activeTab === 'history') {
          const { data: historyData, error: historyError } = await supabase
            .from('checklist_history')
            .select(`*`)
            .eq('checklist_id', checklistId)
            .order('created_at', { ascending: false });
            
          if (historyError) throw historyError;
          
          const historyWithNames = await Promise.all(historyData.map(async (entry) => {
            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', entry.user_id)
              .single();
              
            return {
              id: entry.id,
              checklist_id: entry.checklist_id,
              user_id: entry.user_id,
              user_name: userData?.name || 'Usuário',
              action: entry.action,
              details: entry.details,
              created_at: entry.created_at
            };
          }));
          
          setHistory(historyWithNames);
        }
      } catch (error) {
        console.error("Erro ao carregar dados extras:", error);
        toast.error("Erro ao carregar dados complementares");
      } finally {
        setLoadingExtra(false);
      }
    };
    
    loadExtraData();
  }, [checklistId, activeTab]);

  const handleItemChange = (updatedItem: ChecklistItem) => {
    setItems((prevItems) =>
      prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );

    updateItemMutation.mutate(updatedItem, {
      onError: (error) => {
        console.error("Erro ao atualizar item:", error);
        toast.error("Falha ao atualizar item.");
      }
    });
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId, {
      onSuccess: () => {
        setItems((prevItems) => prevItems.filter(item => item.id !== itemId));
      },
      onError: (error) => {
        console.error("Erro ao excluir item:", error);
        toast.error("Falha ao excluir item.");
      }
    });
  };

  const handleAddItem = (newItem: Partial<ChecklistItem>) => {
    let sanitizedOptions: string[] | null = null;
    
    if (newItem.opcoes) {
      if (Array.isArray(newItem.opcoes)) {
        sanitizedOptions = newItem.opcoes.map(option => String(option));
      } else {
        sanitizedOptions = [String(newItem.opcoes)];
      }
    }
      
    addItemMutation.mutate({
      ...newItem,
      opcoes: sanitizedOptions
    }, {
      onSuccess: (data) => {
        const addedItem: ChecklistItem = {
          ...data,
          tipo_resposta: data.tipo_resposta as "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla",
          opcoes: data.opcoes ? (Array.isArray(data.opcoes) ? data.opcoes.map(String) : [String(data.opcoes)]) : null
        };
        
        setItems((prevItems) => [...prevItems, addedItem]);
        toast.success("Item adicionado com sucesso.");
      },
      onError: (error) => {
        console.error("Erro ao adicionar item:", error);
        toast.error("Falha ao adicionar item.");
      }
    });
  };

  const handleSave = async () => {
    if (!checklist) return;
    
    setSaving(true);
    try {
      await saveChecklistMutation.mutateAsync({
        title: checklist.title,
        description: checklist.description,
        is_template: checklist.is_template,
        status_checklist: checklist.status_checklist,
        category: checklist.category,
        responsible_id: checklist.responsible_id,
        company_id: checklist.company_id,
        due_date: checklist.due_date,
        status: checklist.status
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('checklist_history').insert({
          checklist_id: checklistId,
          user_id: user.id,
          action: 'update',
          details: 'Atualizou informações do checklist'
        });
      }

      toast.success("Checklist salvo com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
      toast.error("Falha ao salvar checklist.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = (comment: ChecklistComment) => {
    setComments(prev => [comment, ...prev]);
  };

  const handleAddAttachment = (attachment: ChecklistAttachment) => {
    setAttachments(prev => [attachment, ...prev]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  if (isLoading) {
    return <div className="py-20 text-center">Carregando...</div>;
  }

  if (!checklist) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Checklist não encontrado</h2>
        <p className="text-muted-foreground mb-6">
          O checklist solicitado não existe ou você não tem permissão para acessá-lo.
        </p>
        <button 
          className="bg-primary text-white px-4 py-2 rounded"
          onClick={() => navigate("/checklists")}
        >
          Voltar para Checklists
        </button>
      </div>
    );
  }

  const totalItems = items.length;
  const completedItems = items.filter(item => item.resposta !== null && item.resposta !== undefined).length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      <ChecklistHeader
        checklist={checklist}
        saving={saving}
        onSave={handleSave}
      />

      {checklist && (
        <div className="grid gap-6">
          <ChecklistForm
            checklist={checklist}
            users={users}
            setChecklist={setChecklist}
          />

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span>{completedItems} de {totalItems} itens ({Math.round(progressPercentage)}%)</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="items" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span>Itens ({totalItems})</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Comentários</span>
                {comments.length > 0 && (
                  <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5">
                    {comments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span>Anexos</span>
                {attachments.length > 0 && (
                  <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5">
                    {attachments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Histórico</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="items" className="space-y-4 pt-4">
              {totalItems === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhum item no checklist</h3>
                  <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                    Este checklist não possui itens. Adicione perguntas usando o formulário abaixo ou importe um novo checklist com itens.
                  </p>
                </div>
              ) : (
                <ChecklistItemsList
                  items={items}
                  onItemChange={handleItemChange}
                  onDeleteItem={handleDeleteItem}
                  questionTypes={questionTypes}
                />
              )}

              <AddChecklistItemForm
                checklistId={checklistId}
                onAddItem={handleAddItem}
                lastOrder={items.length > 0 ? Math.max(...items.map(i => i.ordem)) + 1 : 0}
                questionTypes={questionTypes}
              />
            </TabsContent>
            
            <TabsContent value="comments" className="pt-4">
              {loadingExtra ? (
                <div className="py-10 text-center">Carregando comentários...</div>
              ) : (
                <ChecklistComments
                  checklistId={checklistId}
                  comments={comments}
                  onAddComment={handleAddComment}
                />
              )}
            </TabsContent>
            
            <TabsContent value="attachments" className="pt-4">
              {loadingExtra ? (
                <div className="py-10 text-center">Carregando anexos...</div>
              ) : (
                <ChecklistAttachments
                  checklistId={checklistId}
                  attachments={attachments}
                  onAddAttachment={handleAddAttachment}
                  onRemoveAttachment={handleRemoveAttachment}
                />
              )}
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              {loadingExtra ? (
                <div className="py-10 text-center">Carregando histórico...</div>
              ) : (
                <ChecklistHistoryLog history={history} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
