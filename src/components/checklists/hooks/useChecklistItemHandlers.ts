
import { useState } from "react";
import { ChecklistItem } from "@/types/checklist";
import { useUpdateChecklistItem } from "@/hooks/checklist/useUpdateChecklistItem";
import { useDeleteChecklistItem } from "@/hooks/checklist/useDeleteChecklistItem";
import { useAddChecklistItem } from "@/hooks/checklist/useAddChecklistItem";
import { toast } from "sonner";

export function useChecklistItemHandlers(checklistId: string, items: ChecklistItem[], setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>) {
  const updateItemMutation = useUpdateChecklistItem();
  const deleteItemMutation = useDeleteChecklistItem();
  const addItemMutation = useAddChecklistItem(checklistId);
  
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

  return {
    handleItemChange,
    handleDeleteItem,
    handleAddItem
  };
}
