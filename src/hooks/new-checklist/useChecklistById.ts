import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";

// Function to validate UUID format
const isValidUUID = (id: string): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Transform snake_case db response to camelCase for frontend use
const transformChecklistData = (data: any): ChecklistWithStats => {
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    isTemplate: data.is_template,
    status: data.status_checklist === 'inativo' ? 'inactive' : 'active',
    category: data.category,
    responsibleId: data.responsible_id,
    companyId: data.company_id,
    userId: data.user_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    dueDate: data.due_date,
    isSubChecklist: data.is_sub_checklist,
    origin: data.origin,
    totalQuestions: 0, // Default value, will update after fetching questions
    completedQuestions: 0, // Default value
    questions: [], // Will be populated separately
    groups: [] // Will be populated separately
  };
};

// Transform question data to match ChecklistQuestion type
const transformQuestionData = (q: any): ChecklistQuestion => ({
  id: q.id,
  text: q.pergunta || q.text,
  responseType: q.tipo_resposta as ChecklistQuestion['responseType'], 
  isRequired: q.obrigatorio,
  weight: q.weight || 1,
  allowsPhoto: q.permite_foto || false,
  allowsVideo: q.permite_video || false,
  allowsAudio: q.permite_audio || false,
  allowsFiles: q.permite_files || false, // Added allowsFiles field
  order: q.ordem,
  options: q.opcoes,
  hint: q.hint,
  groupId: null, // We'll set this later when organizing into groups
  parentQuestionId: q.parent_item_id,
  hasSubChecklist: false, // No more subchecklist support
  subChecklistId: null, // No more subchecklist support
  conditionValue: q.condition_value
});

export function useChecklistById(id: string) {
  return useQuery<ChecklistWithStats | null>({
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
      
      // First fetch the checklist basic data
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (checklistError) {
        console.error("Error fetching checklist:", checklistError);
        throw checklistError;
      }

      // Then fetch associated questions with explicit selection to ensure all fields
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (questionsError) {
        console.error("Error fetching checklist questions:", questionsError);
        // Not throwing here, we'll just have an empty questions array
      }

      console.log(`Fetched ${questionsData?.length || 0} questions for checklist ${id}`);

      // Transform the checklist data
      const transformed = transformChecklistData(checklistData);
      
      // Check for parent-child relationship among questions
      const questionsById = new Map();
      const transformedQuestions = (questionsData || []).map(transformQuestionData);
      
      transformedQuestions.forEach(q => {
        questionsById.set(q.id, q);
      });
      
      // Set up default group for questions
      const defaultGroupId = "default";
      const defaultGroup: ChecklistGroup = {
        id: defaultGroupId,
        title: "Geral",
        order: 0
      };
      
      // Group questions by looking for groupId hints in the data
      const groupsMap = new Map<string, ChecklistGroup>();
      groupsMap.set(defaultGroupId, defaultGroup);
      
      // Transform and organize questions
      const organizedQuestions = transformedQuestions.map(question => {
        // Set default groupId if none exists
        question.groupId = question.groupId || defaultGroupId;
        
        // Extract group info from hint if possible
        if (question.hint && question.hint.startsWith('{') && question.hint.includes('groupId')) {
          try {
            const groupInfo = JSON.parse(question.hint);
            if (groupInfo.groupId && groupInfo.groupTitle) {
              if (!groupsMap.has(groupInfo.groupId)) {
                groupsMap.set(groupInfo.groupId, {
                  id: groupInfo.groupId,
                  title: groupInfo.groupTitle,
                  order: groupInfo.groupIndex || 0
                });
              }
              question.groupId = groupInfo.groupId;
              // Clean up the hint by removing the JSON metadata
              question.hint = "";
            }
          } catch (e) {
            // Not valid JSON, keep hint as is
          }
        }
        
        return question;
      });
      
      // Convert groups map to array
      const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
      
      // Assign transformed questions and groups
      transformed.questions = organizedQuestions;
      transformed.groups = groups;
      transformed.totalQuestions = organizedQuestions.length;
      
      console.log(`Returning checklist with ${transformed.questions.length} questions and ${transformed.groups.length} groups`);
      
      return transformed;
    },
    enabled: !!id && id !== "editor", // Only run query if ID exists and isn't "editor"
    retry: 1,
    gcTime: 300000, // 5 minutes
    staleTime: 60000, // 1 minute
  });
}
