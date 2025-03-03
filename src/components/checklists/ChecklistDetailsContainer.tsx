
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
import { supabase } from "@/integrations/supabase/client";

// Define question types configuration
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

  // Check if checklist exists
  useEffect(() => {
    if (error) {
      console.error("Error loading checklist:", error);
      setNotFound(true);
    }
  }, [error]);

  // Redirect if not found
  useEffect(() => {
    if (notFound) {
      toast.error("Checklist não encontrado ou você não tem permissão para acessá-lo");
      navigate("/checklists");
    }
  }, [notFound, navigate]);

  // Handle item change
  const handleItemChange = (updatedItem: ChecklistItem) => {
    const newItems = items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(newItems);
    updateItemMutation.mutate(updatedItem, {
      onError: (error) => {
        console.error("Error updating item:", error);
        toast.error("Erro ao atualizar item");
      }
    });
  };

  // Handle item deletion
  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId, {
      onSuccess: () => {
        setItems(items.filter(item => item.id !== itemId));
      },
      onError: (error) => {
        console.error("Error deleting item:", error);
        toast.error("Erro ao excluir item");
      }
    });
  };

  // Handle adding a new item
  const handleAddItem = (newItem: Partial<ChecklistItem>) => {
    console.log("Adding new item:", newItem);
    addItemMutation.mutate(newItem, {
      onSuccess: (data) => {
        // Convert opcoes to proper format for UI
        let parsedOptions: string[] | null = null;
        if (data.opcoes) {
          try {
            if (Array.isArray(data.opcoes)) {
              parsedOptions = data.opcoes.map(String);
            } else {
              parsedOptions = [];
            }
          } catch (e) {
            console.error("Error parsing opcoes:", e);
            parsedOptions = [];
          }
        }

        const addedItem: ChecklistItem = {
          ...data,
          tipo_resposta: data.tipo_resposta as "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla",
          opcoes: parsedOptions
        };
        
        setItems([...items, addedItem]);
        toast.success("Item adicionado com sucesso");
      },
      onError: (error) => {
        console.error("Error adding item:", error);
        toast.error("Erro ao adicionar item");
      }
    });
  };

  // Save all changes
  const handleSave = async () => {
    if (!checklist) return;
    
    setSaving(true);
    try {
      console.log("Saving checklist:", {
        title: checklist.title,
        description: checklist.description,
        is_template: checklist.is_template,
        status_checklist: checklist.status_checklist,
        category: checklist.category,
        responsible_id: checklist.responsible_id
      });
      
      await saveChecklistMutation.mutateAsync({
        title: checklist.title,
        description: checklist.description,
        is_template: checklist.is_template,
        status_checklist: checklist.status_checklist,
        category: checklist.category,
        responsible_id: checklist.responsible_id
      });
      
      toast.success("Checklist salvo com sucesso");
      setSaving(false);
    } catch (error) {
      console.error("Error saving checklist:", error);
      toast.error("Erro ao salvar checklist");
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center">Carregando...</div>;
  }

  if (!checklist && !isLoading) {
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
