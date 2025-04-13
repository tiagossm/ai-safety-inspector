
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistWithStats } from "@/types/newChecklist";

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
    status: data.status,
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

      // Transform the questions data
      const questions = questionsData ? questionsData.map(q => ({
        id: q.id,
        text: q.pergunta,
        responseType: q.tipo_resposta,
        isRequired: q.obrigatorio,
        weight: q.weight || 1,
        allowsPhoto: q.permite_foto || false,
        allowsVideo: q.permite_video || false,
        allowsAudio: q.permite_audio || false,
        allowsFiles: false, // Default value
        order: q.ordem,
        options: q.opcoes,
        hint: q.hint,
        groupId: null, // Will set this when processing groups
        parentQuestionId: q.parent_item_id,
        conditionValue: q.condition_value,
        subChecklistId: q.sub_checklist_id,
        hasSubChecklist: q.has_subchecklist || false
      })) : [];
      
      // Extract groups from questions' hints
      const groups: ChecklistGroup[] = [];
      const groupMap = new Map();
      
      questions.forEach(q => {
        if (q.hint) {
          try {
            const hintObj = JSON.parse(q.hint);
            if (hintObj && hintObj.groupId && hintObj.groupTitle) {
              if (!groupMap.has(hintObj.groupId)) {
                const group = {
                  id: hintObj.groupId,
                  title: hintObj.groupTitle,
                  order: hintObj.groupIndex || 0
                };
                groups.push(group);
                groupMap.set(hintObj.groupId, group);
              }
              q.groupId = hintObj.groupId;
            }
          } catch (e) {
            // Not a JSON hint, ignore
          }
        }
      });
      
      // If no groups found, create a default one
      if (groups.length === 0) {
        const defaultGroup = {
          id: "default",
          title: "Geral",
          order: 0
        };
        groups.push(defaultGroup);
        
        // Assign all questions to the default group
        questions.forEach(q => {
          q.groupId = "default";
        });
      }
      
      // Create a transformed checklist with questions and groups
      const transformed = transformChecklistData(checklistData);
      transformed.questions = questions;
      transformed.groups = groups;
      
      // Count questions
      transformed.totalQuestions = questions.length;
      
      return transformed;
    },
    enabled: !!id && id !== "editor", // Only run query if ID exists and isn't "editor"
    retry: 1,
    gcTime: 300000, // 5 minutes
    staleTime: 60000, // 1 minute
  });
}
