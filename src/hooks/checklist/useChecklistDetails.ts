
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checklist, ChecklistItem } from "@/types/checklist";

export function useChecklistDetails(id: string) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);

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
      // Need to handle the case where checklistData might not have responsible_id directly
      const responsibleId = checklistData.responsible_id || null;
      
      if (responsibleId) {
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', responsibleId)
          .single();

        if (userData) {
          responsibleName = userData.name;
        }
      }

      // Ensure we return a correctly typed Checklist object
      return {
        ...checklistData,
        responsible_id: responsibleId,
        responsible_name: responsibleName,
        status_checklist: checklistData.status_checklist as "ativo" | "inativo",
        is_template: Boolean(checklistData.is_template)
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

  return {
    checklist,
    setChecklist,
    items,
    setItems,
    users,
    isLoading,
  };
}
