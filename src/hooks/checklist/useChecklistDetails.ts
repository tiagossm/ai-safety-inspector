
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checklist, ChecklistItem } from "@/types/checklist";

export function useChecklistDetails(id: string) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Fetch the checklist data by ID with proper caching and retry logic
  const { data: checklistData, isLoading, error } = useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      console.log("Fetching checklist data for ID:", id);
      
      if (!id) {
        throw new Error("Checklist ID is required");
      }
      
      const { data: checklistData, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar checklist:", error);
        throw error;
      }

      console.log("Raw checklist data:", checklistData);

      // Fetch responsible user name if there's an ID
      let responsibleName = null;
      
      // Access responsible_id safely with type assertion
      const rawData = checklistData as any;
      const responsibleId = rawData.responsible_id || null;
      
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
        id: checklistData.id,
        title: checklistData.title,
        description: checklistData.description,
        created_at: checklistData.created_at,
        updated_at: checklistData.updated_at,
        status_checklist: checklistData.status_checklist as "ativo" | "inativo",
        is_template: Boolean(checklistData.is_template),
        user_id: checklistData.user_id,
        company_id: checklistData.company_id,
        status: checklistData.status,
        // Access category safely with type assertion
        category: (rawData.category !== undefined) ? rawData.category : undefined,
        responsible_id: responsibleId,
        responsible_name: responsibleName
      } as Checklist;
    },
    enabled: !!id,
    // Add caching and retry configuration
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: (failureCount, error) => {
      // Retry 3 times with exponential backoff for network errors
      if (failureCount < 3) {
        console.log(`Retry attempt ${failureCount + 1} for checklist query`);
        return true;
      }
      return false;
    },
  });

  // Fetch checklist items with caching
  const { data: itemsData } = useQuery({
    queryKey: ["checklist-items", id],
    queryFn: async () => {
      console.log("Fetching checklist items for checklist ID:", id);
      
      const { data, error } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Erro ao buscar itens do checklist:", error);
        throw error;
      }

      console.log(`Retrieved ${data.length} checklist items`);

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
    enabled: !!id && !error, // Only fetch items if checklist exists
    // Add caching and retry configuration
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: (failureCount, error) => {
      // Retry 3 times with exponential backoff for network errors
      if (failureCount < 3) {
        console.log(`Retry attempt ${failureCount + 1} for items query`);
        return true;
      }
      return false;
    },
  });

  // Fetch users for responsible selection - with useEffect debounce
  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        // Don't refetch if we already have users
        if (users.length > 0) return;
        
        console.log("Fetching users for responsible selection");
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        if (isMounted) {
          setUsers(data || []);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };
    
    fetchUsers();
    
    return () => {
      isMounted = false;
    };
  }, [users.length]);

  // Update checklist when data is loaded - with check to prevent unnecessary updates
  useEffect(() => {
    if (checklistData && (!checklist || checklist.id !== checklistData.id)) {
      console.log("Setting checklist data:", checklistData);
      setChecklist(checklistData as Checklist);
    }
  }, [checklistData, checklist]);

  // Update items when data is loaded - with check to prevent unnecessary updates
  useEffect(() => {
    if (itemsData && JSON.stringify(items) !== JSON.stringify(itemsData)) {
      console.log("Setting items data:", itemsData.length, "items");
      setItems(itemsData as ChecklistItem[]);
    }
  }, [itemsData, items]);

  return {
    checklist,
    setChecklist,
    items,
    setItems,
    users,
    isLoading,
    error
  };
}
