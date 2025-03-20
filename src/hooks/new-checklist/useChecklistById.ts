
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistGroup, ChecklistQuestion } from "@/types/newChecklist";

// Utility function to validate UUID format
const isValidUUID = (id: string): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Helper to parse group information from hint field
const parseGroupInfo = (hint?: string): { groupId?: string; groupTitle?: string; groupIndex?: number } => {
  if (!hint) return {};
  
  try {
    // Check if hint contains valid JSON with group info
    if (hint.includes('groupId')) {
      const groupInfo = JSON.parse(hint);
      return {
        groupId: groupInfo.groupId,
        groupTitle: groupInfo.groupTitle,
        groupIndex: groupInfo.groupIndex
      };
    }
  } catch (e) {
    // If not valid JSON, just return the hint as is
    console.warn("Invalid group info JSON:", hint);
  }
  
  return {};
};

// Map database response type to our TypeScript type
const mapResponseType = (dbType: string): ChecklistQuestion['responseType'] => {
  const typeMap: Record<string, ChecklistQuestion['responseType']> = {
    'yes_no': 'yes_no',
    'multiple_choice': 'multiple_choice',
    'text': 'text',
    'numeric': 'numeric',
    'photo': 'photo',
    'signature': 'signature'
  };
  
  return typeMap[dbType] || 'text';
};

export function useChecklistById(id: string) {
  return useQuery({
    queryKey: ["new-checklist", id],
    queryFn: async (): Promise<ChecklistWithStats | null> => {
      // Skip query if ID is empty or "new"
      if (!id || id === "new") {
        return null;
      }

      // Validate UUID format to prevent DB errors
      if (!isValidUUID(id)) {
        console.error("Invalid UUID format:", id);
        throw new Error("ID de checklist inválido");
      }

      console.log(`Fetching checklist with ID: ${id}`);
      
      // Fetch the checklist
      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .select(`
          id,
          title,
          description,
          is_template as isTemplate,
          status_checklist as status,
          category,
          responsible_id as responsibleId,
          company_id as companyId,
          user_id as userId,
          created_at as createdAt,
          updated_at as updatedAt,
          due_date as dueDate
        `)
        .eq("id", id)
        .single();

      if (checklistError) {
        console.error("Error fetching checklist:", checklistError);
        throw checklistError;
      }

      // Fetch checklist questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select(`
          id,
          pergunta as text,
          tipo_resposta,
          obrigatorio as isRequired,
          opcoes as options,
          hint,
          weight,
          parent_item_id as parentQuestionId,
          condition_value as conditionValue,
          permite_foto as allowsPhoto,
          permite_video as allowsVideo,
          permite_audio as allowsAudio,
          ordem as order
        `)
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (questionsError) {
        console.error(`Error fetching questions for checklist ${id}:`, questionsError);
        throw questionsError;
      }

      // Process questions and extract group information
      const groupsMap = new Map<string, ChecklistGroup>();
      const processedQuestions: ChecklistQuestion[] = [];

      questionsData.forEach((q) => {
        // Parse group info from hint
        const { groupId, groupTitle } = parseGroupInfo(q.hint);
        
        // If there's a group ID and we haven't seen it before, add it to our groups map
        if (groupId && !groupsMap.has(groupId) && groupTitle) {
          groupsMap.set(groupId, {
            id: groupId,
            title: groupTitle,
            order: groupsMap.size
          });
        }

        // Convert database question to our format
        processedQuestions.push({
          id: q.id,
          text: q.text,
          responseType: mapResponseType(q.tipo_resposta),
          isRequired: q.isRequired,
          options: Array.isArray(q.options) ? q.options : undefined,
          hint: q.hint,
          weight: q.weight || 1,
          groupId: groupId,
          parentQuestionId: q.parentQuestionId,
          conditionValue: q.conditionValue,
          allowsPhoto: q.allowsPhoto,
          allowsVideo: q.allowsVideo,
          allowsAudio: q.allowsAudio,
          order: q.order
        });
      });

      // Convert groups map to array and sort by order
      const groups = Array.from(groupsMap.values())
        .sort((a, b) => a.order - b.order);

      return {
        ...checklist,
        groups,
        questions: processedQuestions,
        totalQuestions: questionsData.length,
        completedQuestions: 0 // In a real app, we'd calculate this
      };
    },
    enabled: !!id && id !== "new",
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
}
