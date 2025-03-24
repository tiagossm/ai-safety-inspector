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
    if (hint.includes("groupId")) {
      const groupInfo = JSON.parse(hint);
      return {
        groupId: groupInfo.groupId,
        groupTitle: groupInfo.groupTitle,
        groupIndex: groupInfo.groupIndex
      };
    }
  } catch (e) {
    console.warn("Invalid group info JSON:", hint);
  }
  return {};
};

// Map database response type to our TypeScript type
const mapResponseType = (dbType: string): ChecklistQuestion["responseType"] => {
  const typeMap: Record<string, ChecklistQuestion["responseType"]> = {
    yes_no: "yes_no",
    multiple_choice: "multiple_choice",
    text: "text",
    numeric: "numeric",
    photo: "photo",
    signature: "signature",
    "sim/não": "yes_no",
    "seleção múltipla": "multiple_choice",
    texto: "text",
    numérico: "numeric",
    foto: "photo",
    assinatura: "signature"
  };
  return typeMap[dbType] || "text";
};

export function useChecklistById(id: string) {
  return useQuery({
    queryKey: ["new-checklist", id],
    queryFn: async (): Promise<ChecklistWithStats | null> => {
      if (!id || id === "new" || id === "editor") {
        console.log("Skipping query for special ID:", id);
        return null;
      }

      if (!isValidUUID(id)) {
        console.error("Invalid UUID format:", id);
        throw new Error("ID de checklist inválido");
      }

      console.log(`Fetching checklist with ID: ${id}`);

      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .select(`
          id,
          title,
          description,
          is_template,
          status_checklist,
          category,
          responsible_id,
          company_id,
          user_id,
          created_at,
          updated_at,
          due_date
        `)
        .eq("id", id)
        .single();

      if (checklistError) {
        console.error("Error fetching checklist:", checklistError);
        throw checklistError;
      }

      if (!checklistData) {
        console.error("No checklist found with ID:", id);
        throw new Error("Checklist não encontrado");
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select(`
          id,
          pergunta,
          tipo_resposta,
          obrigatorio,
          opcoes,
          hint,
          weight,
          parent_item_id,
          condition_value,
          permite_foto,
          permite_video,
          permite_audio,
          ordem,
          sub_checklist_id
        `)
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (questionsError) {
        console.error("Error fetching questions for checklist:", questionsError);
        throw questionsError;
      }

      console.log(`Retrieved ${questionsData?.length || 0} questions for checklist ${id}`);

      const groupsMap = new Map<string, ChecklistGroup>();
      const processedQuestions: ChecklistQuestion[] = [];

      (questionsData || []).forEach((q) => {
        const { groupId, groupTitle } = parseGroupInfo(q.hint || undefined);

        if (groupId && !groupsMap.has(groupId) && groupTitle) {
          groupsMap.set(groupId, {
            id: groupId,
            title: groupTitle,
            order: groupsMap.size
          });
        }

        const options = Array.isArray(q.opcoes)
          ? q.opcoes.map(String)
          : typeof q.opcoes === "string"
          ? [q.opcoes]
          : undefined;

        processedQuestions.push({
          id: q.id,
          text: q.pergunta,
          responseType: mapResponseType(q.tipo_resposta),
          isRequired: q.obrigatorio,
          options,
          hint: q.hint || undefined,
          weight: q.weight || 1,
          groupId: groupId,
          parentQuestionId: q.parent_item_id || undefined,
          conditionValue: q.condition_value || undefined,
          allowsPhoto: q.permite_foto || false,
          allowsVideo: q.permite_video || false,
          allowsAudio: q.permite_audio || false,
          order: q.ordem,
          hasSubChecklist: !!q.sub_checklist_id,
          subChecklistId: q.sub_checklist_id || undefined
        });
      });

      const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);

      const checklistWithStats: ChecklistWithStats = {
        id: checklistData.id,
        title: checklistData.title,
        description: checklistData.description || undefined,
        isTemplate: checklistData.is_template,
        status: checklistData.status_checklist === "ativo" ? "active" : "inactive",
        category: checklistData.category || undefined,
        responsibleId: checklistData.responsible_id || undefined,
        companyId: checklistData.company_id || undefined,
        userId: checklistData.user_id || undefined,
        createdAt: checklistData.created_at,
        updatedAt: checklistData.updated_at,
        dueDate: checklistData.due_date || undefined,
        groups,
        questions: processedQuestions,
        totalQuestions: questionsData?.length || 0,
        completedQuestions: 0
      };

      return checklistWithStats;
    },
    enabled: !!id && id !== "new" && id !== "editor",
    staleTime: 60000,
    gcTime: 300000
  });
}
