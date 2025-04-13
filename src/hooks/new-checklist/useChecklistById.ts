
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
    status: data.status || data.status_checklist,
    category: data.category,
    responsibleId: data.responsible_id,
    companyId: data.company_id,
    userId: data.user_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    dueDate: data.due_date,
    isSubChecklist: data.is_sub_checklist,
    origin: data.origin,
    totalQuestions: 0, // Default value
    completedQuestions: 0, // Default value
    questions: [], // Will be populated separately if needed
    groups: [] // Will be populated separately if needed
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
  allowsFiles: false,
  order: q.ordem,
  options: q.opcoes,
  hint: q.hint,
  groupId: null,
  parentQuestionId: q.parent_item_id,
  hasSubChecklist: q.has_subchecklist || false,
  subChecklistId: q.sub_checklist_id,
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

      // Then fetch associated questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (questionsError) {
        console.error("Error fetching checklist questions:", questionsError);
        // Not throwing here, we'll just have an empty questions array
      }

      // Transform the checklist data
      const transformed = transformChecklistData(checklistData);
      
      // Transform and assign questions
      transformed.questions = questionsData 
        ? questionsData.map(transformQuestionData)
        : [];
      
      // Assign total questions count
      transformed.totalQuestions = transformed.questions.length;
      
      return transformed;
    },
    enabled: !!id && id !== "editor", // Only run query if ID exists and isn't "editor"
    retry: 1,
    gcTime: 300000, // 5 minutes
    staleTime: 60000, // 1 minute
  });
}
