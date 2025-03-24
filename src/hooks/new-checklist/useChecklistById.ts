
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistWithStats } from "@/types/newChecklist";

// Helper function to ensure responseType is correctly typed
const mapResponseType = (type: string): "yes_no" | "multiple_choice" | "text" | "numeric" | "photo" | "signature" => {
  switch (type) {
    case "yes_no": return "yes_no";
    case "multiple_choice": return "multiple_choice";
    case "text": return "text";
    case "numeric": return "numeric";
    case "photo": return "photo";
    case "signature": return "signature";
    default: return "yes_no"; // Default to yes_no if type is unrecognized
  }
};

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
      
      // Transform questions data into the expected format with proper types
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
        
        // Handle options conversion from JSON to string array
        let options: string[] = [];
        if (item.opcoes) {
          // If opcoes is already an array, convert all items to strings
          if (Array.isArray(item.opcoes)) {
            options = item.opcoes.map(opt => String(opt));
          } 
          // If it's a string, try to parse it as JSON
          else if (typeof item.opcoes === 'string') {
            try {
              const parsedOptions = JSON.parse(item.opcoes);
              if (Array.isArray(parsedOptions)) {
                options = parsedOptions.map(opt => String(opt));
              }
            } catch (e) {
              console.warn("Failed to parse options:", e);
            }
          }
        }
        
        return {
          id: item.id,
          text: item.pergunta,
          responseType: mapResponseType(item.tipo_resposta), // Convert to expected enum value
          isRequired: item.obrigatorio,
          options: options, // Now correctly typed as string[]
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
      
      // Map database fields (snake_case) to frontend properties (camelCase)
      // Ensure status field is properly typed as "active" | "inactive"
      const status = checklistData.status === "inactive" ? "inactive" : "active";
      
      const result: ChecklistWithStats = {
        id: checklistData.id,
        title: checklistData.title,
        description: checklistData.description,
        isTemplate: checklistData.is_template,
        status: status, // Now properly typed
        category: checklistData.category,
        responsibleId: checklistData.responsible_id,
        companyId: checklistData.company_id,
        userId: checklistData.user_id,
        createdAt: checklistData.created_at,
        updatedAt: checklistData.updated_at,
        dueDate: checklistData.due_date,
        questions: transformedQuestions || [], // Now properly typed
        groups: groups,
        totalQuestions: transformedQuestions?.length || 0
      };
      
      return result;
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
    retry: 1
  });
};
