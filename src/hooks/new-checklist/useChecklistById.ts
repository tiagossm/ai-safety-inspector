import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion, ChecklistWithStats, ChecklistGroup } from "@/types/newChecklist";

// Validate UUID format
function isValidUUID(id: string): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

interface UseChecklistByIdResult {
  data: ChecklistWithStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useChecklistById(id: string): UseChecklistByIdResult {
  const {
    data,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      if (!id || !isValidUUID(id)) {
        throw new Error(`Invalid checklist ID: ${id}`);
      }

      // Get the checklist details
      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .select(`
          *,
          companies(*),
          users:responsible_id(*)
        `)
        .eq("id", id)
        .single();

      if (checklistError) {
        console.error("Error fetching checklist:", checklistError);
        throw checklistError;
      }

      if (!checklist) {
        throw new Error(`Checklist with ID ${id} not found`);
      }

      // Get the questions for this checklist
      const { data: questions, error: questionsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (questionsError) {
        console.error("Error fetching checklist questions:", questionsError);
        throw questionsError;
      }

      // Transform questions into the expected format
      const transformedQuestions: ChecklistQuestion[] = questions.map(q => {
        // Try to parse any group information from the hint field
        let groupId = null;
        let hint = q.hint;

        try {
          if (q.hint && typeof q.hint === 'string' && q.hint.startsWith('{')) {
            const hintData = JSON.parse(q.hint);
            if (hintData.groupId) {
              groupId = hintData.groupId;
              hint = ''; // Clear the hint as it was just metadata
            }
          }
        } catch (e) {
          // If parsing fails, keep the original hint
          console.warn("Failed to parse hint JSON:", e);
        }

        return {
          id: q.id,
          text: q.pergunta,
          responseType: q.tipo_resposta,
          isRequired: q.obrigatorio,
          allowsPhoto: q.permite_foto || false,
          allowsVideo: q.permite_video || false,
          allowsAudio: q.permite_audio || false,
          options: q.opcoes || [],
          hint: hint || '',
          weight: q.weight || 1,
          order: q.ordem,
          groupId: groupId,
          parentQuestionId: q.parent_item_id,
          subChecklistId: q.sub_checklist_id,
          hasSubChecklist: q.has_subchecklist || false,
          displayNumber: `${q.ordem + 1}`,
          parentId: q.parent_item_id,
          conditionValue: q.condition_value
        };
      });

      // Extract groups from question hints if available
      const groupsMap = new Map<string, ChecklistGroup>();
      transformedQuestions.forEach(q => {
        if (q.groupId) {
          if (!groupsMap.has(q.groupId)) {
            // Create a default group if we have a groupId but no group info
            groupsMap.set(q.groupId, {
              id: q.groupId,
              title: `Group ${groupsMap.size + 1}`,
              order: groupsMap.size
            });
          }
        }
      });

      // Convert map to array and sort by order
      const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);

      // Construct the returned checklist with all required fields
      const result: ChecklistWithStats = {
        id: checklist.id,
        title: checklist.title,
        description: checklist.description || "",
        isTemplate: checklist.is_template,
        is_template: checklist.is_template, // Include both formats for compatibility
        status: checklist.status || "active",
        category: checklist.category || "",
        theme: checklist.theme || "", // Add default value if not present
        responsibleId: checklist.responsible_id || "",
        companyId: checklist.company_id || "",
        userId: checklist.user_id || "",
        createdAt: checklist.created_at,
        updatedAt: checklist.updated_at,
        dueDate: checklist.due_date,
        isSubChecklist: checklist.is_sub_checklist || false,
        origin: checklist.origin || "manual",
        totalQuestions: transformedQuestions.length,
        completedQuestions: 0,
        // Add company name if available
        companyName: checklist.companies?.fantasy_name || "",
        // Add responsible name if available
        responsibleName: checklist.users?.name || "",
        // Add questions and groups
        questions: transformedQuestions,
        groups: groups
      };

      return result;
    },
    enabled: !!id && isValidUUID(id),
    retry: 1,
    gcTime: 300000, // 5 minutes
    staleTime: 60000 // 1 minute
  });

  return {
    data: data || null,
    loading,
    error: error as Error | null,
    refetch
  };
}
