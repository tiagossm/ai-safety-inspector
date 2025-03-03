
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checklist, ChecklistItem } from "@/types/checklist";
import ChecklistHeader from "@/components/checklists/ChecklistHeader";
import ChecklistForm from "@/components/checklists/ChecklistForm";
import ChecklistItemsList from "@/components/checklists/ChecklistItemsList";
import AddChecklistItemForm from "@/components/checklists/AddChecklistItemForm";

// Define Json type for clarity
type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];
type Json = JsonValue;

export default function ChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Question types configuration
  const questionTypes = [
    { value: "sim/não", label: "Sim/Não" },
    { value: "numérico", label: "Resposta Numérica" },
    { value: "texto", label: "Resposta em Texto" },
    { value: "foto", label: "Foto" },
    { value: "assinatura", label: "Assinatura" },
    { value: "seleção múltipla", label: "Seleção Múltipla" }
  ];

  // Fetch the checklist data by ID
  const { data: checklistData, isLoading } = useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      const { data: checklistData, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar checklist:", error);
        toast.error("Erro ao carregar checklist");
        throw error;
      }

      // Fetch responsible user name if there's an ID
      let responsibleName = null;
      if (checklistData.responsible_id) {
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', checklistData.responsible_id)
          .single();

        if (userData) {
          responsibleName = userData.name;
        }
      }

      return {
        ...checklistData,
        responsible_name: responsibleName,
        status_checklist: checklistData.status_checklist as "ativo" | "inativo",
      } as Checklist;
    },
    enabled: !!id,
  });

  // Fetch checklist items
  const { data: itemsData } = useQuery({
    queryKey: ["checklist-items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Erro ao buscar itens do checklist:", error);
        toast.error("Erro ao carregar itens do checklist");
        throw error;
      }

      return data.map(item => {
        // Convert opcoes from Json to string[] if it exists
        let parsedOptions: string[] | null = null;
        if (item.opcoes) {
          try {
            // If opcoes is already an array, use it directly
            if (Array.isArray(item.opcoes)) {
              parsedOptions = item.opcoes.map(String);
            } 
            // If it's a JSON string, parse it
            else if (typeof item.opcoes === 'string') {
              parsedOptions = JSON.parse(item.opcoes);
            }
            // If it's a JSON object already, convert values to strings
            else {
              parsedOptions = Array.isArray(item.opcoes) 
                ? item.opcoes.map(String) 
                : [];
            }
          } catch (e) {
            console.error("Error parsing opcoes:", e);
            parsedOptions = [];
          }
        }

        return {
          ...item,
          tipo_resposta: item.tipo_resposta as "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla",
          opcoes: parsedOptions
        } as ChecklistItem;
      });
    },
    enabled: !!id,
  });

  // Fetch users for responsible selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };
    
    fetchUsers();
  }, []);

  // Update checklist when data is loaded
  useEffect(() => {
    if (checklistData) {
      setChecklist(checklistData as Checklist);
    }
  }, [checklistData]);

  // Update items when data is loaded
  useEffect(() => {
    if (itemsData) {
      setItems(itemsData as ChecklistItem[]);
    }
  }, [itemsData]);

  // Item update mutation
  const updateItemMutation = useMutation({
    mutationFn: async (item: ChecklistItem) => {
      // Prepare opcoes for storage - ensure it's compatible with JSON
      const opcoesFinal = item.opcoes ? item.opcoes : null;

      const { error } = await supabase
        .from("checklist_itens")
        .update({
          pergunta: item.pergunta,
          tipo_resposta: item.tipo_resposta,
          obrigatorio: item.obrigatorio,
          ordem: item.ordem,
          opcoes: opcoesFinal
        })
        .eq("id", item.id);

      if (error) throw error;
    },
    onError: (error) => {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item do checklist");
    }
  });

  // Item delete mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("checklist_itens")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item removido com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao excluir item:", error);
      toast.error("Erro ao remover item do checklist");
    }
  });

  // Item add mutation
  const addItemMutation = useMutation({
    mutationFn: async (newItem: Partial<ChecklistItem>) => {
      // Prepare opcoes for storage - ensure it's compatible with JSON
      const opcoesFinal = newItem.opcoes ? newItem.opcoes : null;

      const { data, error } = await supabase
        .from("checklist_itens")
        .insert({
          checklist_id: id,
          pergunta: newItem.pergunta,
          tipo_resposta: newItem.tipo_resposta,
          obrigatorio: newItem.obrigatorio,
          ordem: newItem.ordem,
          opcoes: opcoesFinal
        })
        .select();

      if (error) throw error;
      return data[0];
    },
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
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item ao checklist");
    }
  });

  // Checklist update mutation
  const updateChecklistMutation = useMutation({
    mutationFn: async (data: Partial<Checklist>) => {
      const { error } = await supabase
        .from("checklists")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist atualizado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao atualizar checklist:", error);
      toast.error("Erro ao atualizar checklist");
    }
  });

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
    addItemMutation.mutate(newItem);
  };

  // Save all changes
  const handleSave = async () => {
    if (!checklist) return;
    
    setSaving(true);
    try {
      await updateChecklistMutation.mutateAsync({
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
            checklistId={id!}
            onAddItem={handleAddItem}
            lastOrder={items.length > 0 ? Math.max(...items.map(i => i.ordem)) + 1 : 0}
            questionTypes={questionTypes}
          />
        </div>
      )}
    </div>
  );
}
