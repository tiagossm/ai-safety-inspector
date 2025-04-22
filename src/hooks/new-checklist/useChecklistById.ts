
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistWithStats, ChecklistQuestion } from "@/types/newChecklist";

// Function to validate UUID format
const isValidUUID = (id: string): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Helper function to transform raw checklist data to the expected format
const transformChecklistData = (data: any): ChecklistWithStats => {
  if (!data) return null;
  
  return {
    id: data.id,
    title: data.title || "",
    description: data.description || "",
    isTemplate: data.is_template || false,
    status: data.status || "active",
    category: data.category || "",
    responsibleId: data.responsible_id || null,
    companyId: data.company_id || null,
    userId: data.user_id || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    dueDate: data.due_date,
    isSubChecklist: data.is_sub_checklist || false,
    origin: data.origin || "manual",
    totalQuestions: data.total_questions || 0,
    completedQuestions: 0,
    questions: [], // Will be populated by separate query if needed
    groups: []     // Will be populated by separate query if needed
  };
};

// Function to normalize response type to match the ChecklistQuestion type requirements
const normalizeResponseType = (responseType: string): "yes_no" | "text" | "multiple_choice" | "numeric" | "photo" | "signature" => {
  if (!responseType) return "text";
  
  const type = responseType.toLowerCase();
  
  if (type.includes('sim/não') || type.includes('yes_no') || type.includes('yes/no')) {
    return "yes_no";
  } else if (type.includes('múltipla') || type.includes('multiple')) {
    return "multiple_choice";
  } else if (type.includes('texto') || type.includes('text')) {
    return "text";
  } else if (type.includes('numeric') || type.includes('numérico')) {
    return "numeric";
  } else if (type.includes('foto') || type.includes('photo')) {
    return "photo";
  } else if (type.includes('signature') || type.includes('assinatura')) {
    return "signature";
  }

  // Default fallback to text if no match is found
  return "text";
};

export function useChecklistById(id: string) {
  return useQuery({
    queryKey: ["checklists", id],
    queryFn: async () => {
      // Skip query if ID is empty or "editor"
      if (!id || id === "editor") {
        return null;
      }

      // Validate UUID format to prevent DB errors
      if (!isValidUUID(id)) {
        console.error("Invalid UUID format:", id);
        throw new Error("ID de checklist inválido");
      }

      console.log(`Fetching checklist with ID: ${id}`);
      try {
        // First, get the basic checklist data
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", id)
          .single();

        if (checklistError) {
          console.error("Error fetching checklist:", checklistError);
          throw checklistError;
        }

        // Then, get the checklist items/questions
        const { data: questionData, error: questionError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", id)
          .order("ordem", { ascending: true });

        if (questionError) {
          console.error("Error fetching checklist questions:", questionError);
          // Don't throw, we can still return the checklist without questions
        }

        // Transform the raw data into the expected format
        const transformedData = transformChecklistData(checklistData);
        
        // Add questions if we have them
        if (questionData) {
          // Process questions to group by section/group
          const groups = new Map();
          const DEFAULT_GROUP = { id: 'default', title: 'Geral', order: 0 };
          groups.set(DEFAULT_GROUP.id, DEFAULT_GROUP);

          // Map questions to the expected format with properly typed responseType
          transformedData.questions = questionData.map(item => {
            // Extract any group info from hint if available
            let groupId = DEFAULT_GROUP.id;
            if (item.hint) {
              try {
                const hint = typeof item.hint === 'string' ? JSON.parse(item.hint) : item.hint;
                if (hint.groupId && hint.groupTitle) {
                  groupId = hint.groupId;
                  if (!groups.has(groupId)) {
                    groups.set(groupId, {
                      id: groupId,
                      title: hint.groupTitle,
                      order: hint.groupIndex || groups.size
                    });
                  }
                }
              } catch (e) {
                // Ignore parsing errors and keep default group
              }
            }

            // Normalize the response type to ensure it matches the expected union type
            const normalizedResponseType = normalizeResponseType(item.tipo_resposta);

            // Transform question format with normalized responseType
            return {
              id: item.id,
              text: item.pergunta,
              responseType: normalizedResponseType,
              isRequired: item.obrigatorio,
              weight: item.weight || 1,
              allowsPhoto: item.permite_foto || false,
              allowsVideo: item.permite_video || false,
              allowsAudio: item.permite_audio || false,
              allowsFiles: item.permite_files || false,
              order: item.ordem,
              options: item.opcoes,
              hint: item.hint,
              groupId,
              parentQuestionId: item.parent_item_id,
              conditionValue: item.condition_value,
              hasSubChecklist: !!item.sub_checklist_id,
              subChecklistId: item.sub_checklist_id
            } as ChecklistQuestion;
          });

          // Add the extracted groups
          transformedData.groups = Array.from(groups.values())
            .sort((a, b) => a.order - b.order);
        }

        return transformedData;
      } catch (err) {
        console.error("Error in checklist fetch:", err);
        toast.error("Não foi possível carregar o checklist. Verifique sua conexão ou tente novamente.");
        throw err;
      }
    },
    enabled: !!id && id !== "editor", // Only run query if ID exists and isn't "editor"
    retry: 1,
    gcTime: 300000, // 5 minutes
    staleTime: 60000, // 1 minute
  });
}
