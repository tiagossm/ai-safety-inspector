
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChecklistById = (id: string) => {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Checklist ID is required");
      }

      console.log(`Fetching checklist with ID: ${id}`);
      
      // Fetch basic checklist data
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();
      
      if (checklistError) {
        console.error("Error fetching checklist:", checklistError);
        throw checklistError;
      }
      
      if (!checklistData) {
        console.error("No checklist found with ID:", id);
        throw new Error("Checklist not found");
      }
      
      console.log("Fetched checklist:", checklistData);
      
      // Fetch all questions for this checklist
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });
      
      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        throw questionsError;
      }
      
      console.log(`Fetched ${questionsData?.length || 0} questions for checklist ID ${id}`);
      
      // Transform questions data into the expected format
      const transformedQuestions = questionsData?.map(item => {
        // Extract group information from hint if it exists
        let groupId = null;
        try {
          if (item.hint && item.hint.includes("groupId")) {
            const groupInfo = JSON.parse(item.hint);
            groupId = groupInfo.groupId;
          }
        } catch (e) {
          console.warn("Failed to parse group info from hint:", item.hint);
        }
        
        return {
          id: item.id,
          text: item.pergunta,
          responseType: item.tipo_resposta,
          isRequired: item.obrigatorio,
          options: item.opcoes,
          allowsPhoto: item.permite_foto,
          allowsVideo: item.permite_video,
          allowsAudio: item.permite_audio,
          hint: item.hint,
          weight: item.weight || 1,
          parentQuestionId: item.parent_item_id,
          conditionValue: item.condition_value,
          order: item.ordem,
          groupId: groupId
        };
      });
      
      // Extract group information from questions
      const groupMap = new Map();
      
      transformedQuestions?.forEach(question => {
        if (question.groupId) {
          let groupInfo;
          try {
            // Try to parse group info from hint
            if (question.hint && question.hint.includes("groupId")) {
              groupInfo = JSON.parse(question.hint);
            }
          } catch (e) {
            console.warn("Failed to parse group info:", e);
          }
          
          if (!groupMap.has(question.groupId)) {
            groupMap.set(question.groupId, {
              id: question.groupId,
              title: groupInfo?.groupTitle || `Grupo ${groupMap.size + 1}`,
              order: groupInfo?.groupIndex || groupMap.size
            });
          }
        }
      });
      
      // Convert groups to array
      const groups = Array.from(groupMap.values());
      
      // If there are questions but no groups, create a default group
      if (transformedQuestions?.length > 0 && groups.length === 0) {
        groups.push({
          id: `group-default-${Date.now()}`,
          title: "Geral",
          order: 0
        });
        
        // Assign all questions to the default group
        transformedQuestions.forEach(question => {
          question.groupId = groups[0].id;
        });
      }
      
      console.log(`Created ${groups.length} groups from questions data`);
      
      // Return the complete checklist data
      return {
        ...checklistData,
        questions: transformedQuestions || [],
        groups: groups
      };
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
    retry: 1
  });
};
