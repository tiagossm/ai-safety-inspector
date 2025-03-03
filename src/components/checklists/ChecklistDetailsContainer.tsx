
import { useState } from "react";
import { useParams } from "react-router-dom";
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
  const [saving, setSaving] = useState(false);
  
  const {
    checklist,
    setChecklist,
    items,
    setItems,
    users,
    isLoading
  } = useChecklistDetails(id);

  const updateItemMutation = useUpdateChecklistItem();
  const deleteItemMutation = useDeleteChecklistItem();
  const addItemMutation = useAddChecklistItem(id);
  const saveChecklistMutation = useSaveChecklist(id);

  // Handle item change
  const handleItemChange = (updatedItem: ChecklistItem) => {
    const newItems = items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(newItems);
    updateItemMutation.mutate(updatedItem);
  };

  // Handle item deletion
  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId);
    setItems(items.filter(item => item.id !== itemId));
  };

  // Handle adding a new item
  const handleAddItem = (newItem: Partial<ChecklistItem>) => {
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
      }
    });
  };

  // Save all changes
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
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center">Carregando...</div>;
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
