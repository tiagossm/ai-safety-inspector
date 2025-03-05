
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChecklistItem } from "@/types/checklist";
import { useChecklistDetails } from "@/hooks/checklist/useChecklistDetails";
import { useUpdateChecklistItem } from "@/hooks/checklist/useUpdateChecklistItem";
import { useDeleteChecklistItem } from "@/hooks/checklist/useDeleteChecklistItem";
import { useAddChecklistItem } from "@/hooks/checklist/useAddChecklistItem";
import { useSaveChecklist } from "@/hooks/checklist/useSaveChecklist";
import ChecklistHeader from "@/components/checklists/ChecklistHeader";
import ChecklistForm from "@/components/checklists/ChecklistForm";
import ChecklistItemsList from "@/components/checklists/ChecklistItemsList";
import AddChecklistItemForm from "@/components/checklists/AddChecklistItemForm";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress"; // Barra de progresso

// Tipos de perguntas disponíveis no checklist
const questionTypes = [
  { value: "sim/não", label: "Sim/Não" },
  { value: "numérico", label: "Resposta Numérica" },
  { value: "texto", label: "Resposta em Texto" },
  { value: "foto", label: "Foto" },
  { value: "assinatura", label: "Assinatura" },
  { value: "seleção múltipla", label: "Seleção Múltipla" }
];

export default function ChecklistDetailsContainer() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  const {
    checklist,
    setChecklist,
    items,
    setItems,
    users,
    isLoading,
    error
  } = useChecklistDetails(id);

  const updateItemMutation = useUpdateChecklistItem();
  const deleteItemMutation = useDeleteChecklistItem();
  const addItemMutation = useAddChecklistItem(id);
  const saveChecklistMutation = useSaveChecklist(id);

  // Verifica se o checklist existe e trata erros
  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar checklist:", error);
      setNotFound(true);
    }
  }, [error]);

  // Redireciona caso o checklist não seja encontrado
  useEffect(() => {
    if (notFound) {
      toast.error("Checklist não encontrado ou acesso negado.");
      navigate("/checklists");
    }
  }, [notFound, navigate]);

  // Função para atualizar um item do checklist
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

  // Função para deletar um item do checklist
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

  // Função para adicionar um novo item ao checklist
  const handleAddItem = (newItem: Partial<ChecklistItem>) => {
    // Ensure opcoes is always an array of strings or null
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

  // Função para salvar o checklist atualizado
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
        responsible_id: checklist.responsible_id
      });

      toast.success("Checklist salvo com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
      toast.error("Falha ao salvar checklist.");
    } finally {
      setSaving(false);
    }
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

  // Calculate progress or provide defaults
  const totalItems = items.length;
  const completedItems = checklist.items_completed || 0;
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

          {/* Barra de progresso para indicar andamento */}
          <Progress value={progressPercentage} className="mt-2" />

          <ChecklistItemsList
            items={items}
            onItemChange={handleItemChange}
            onDeleteItem={handleDeleteItem}
            questionTypes={questionTypes}
          />

          <AddChecklistItemForm
            checklistId={id}
            onAddItem={handleAddItem}
            lastOrder={items.length > 0 ? Math.max(...items.map(i => i.ordem)) + 1 : 0}
            questionTypes={questionTypes}
          />
        </div>
      )}
    </div>
  );
}
