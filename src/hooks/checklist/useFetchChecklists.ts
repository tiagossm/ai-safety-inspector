
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { generateMockCollaborators } from "@/utils/checklistUtils";

export function useFetchChecklists() {
  return useQuery({
    queryKey: ["checklists"],
    queryFn: async () => {
      console.log("Buscando checklists...");
      
      // First fetch the checklists
      const { data: checklists, error } = await supabase
        .from("checklists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar checklists:", error);
        throw error;
      }

      console.log("Checklists recebidos do Supabase:", checklists);
      
      // Fetch responsible users information where available
      const responsibleIds = checklists
        .filter(c => c.responsible_id)
        .map(c => c.responsible_id);
      
      let usersMap = {};
      
      if (responsibleIds.length > 0) {
        try {
          const { data: users } = await supabase
            .from('users')
            .select('id, name')
            .in('id', responsibleIds);
            
          if (users) {
            usersMap = users.reduce((acc, user) => {
              acc[user.id] = user.name;
              return acc;
            }, {});
          }
        } catch (err) {
          console.error("Erro ao buscar responsáveis:", err);
        }
      }
      
      // For each checklist, get the number of items
      const checklistsWithItems = await Promise.all(
        checklists.map(async (checklist) => {
          try {
            const { count, error: itemsError } = await supabase
              .from("checklist_itens")
              .select("*", { count: "exact", head: true })
              .eq("checklist_id", checklist.id);
              
            if (itemsError) throw itemsError;
            
            return {
              ...checklist,
              items: count || 0,
              // Get the responsible name from the users map
              responsible_name: checklist.responsible_id ? usersMap[checklist.responsible_id] || 'Usuário não encontrado' : null,
              // Ensure status_checklist is always "ativo" or "inativo"
              status_checklist: checklist.status_checklist === "inativo" ? "inativo" : "ativo",
              // Ensure is_template is boolean
              is_template: Boolean(checklist.is_template),
              // Add mock data for UI
              collaborators: generateMockCollaborators(2),
              permissions: ["editor"]
            };
          } catch (err) {
            console.error(`Erro ao buscar itens para checklist ${checklist.id}:`, err);
            return {
              ...checklist,
              // Mock data for UI
              items: 0,
              collaborators: generateMockCollaborators(1),
              permissions: ["viewer"]
            };
          }
        })
      );

      return checklistsWithItems as Checklist[];
    }
  });
}
