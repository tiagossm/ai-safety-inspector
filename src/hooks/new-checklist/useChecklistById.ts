
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

// Define types for database responses to avoid TypeScript errors
type ChecklistDBResponse = {
  id: string;
  title: string;
  description: string | null;
  isTemplate: boolean;
  status: string;
  category: string | null;
  responsibleId: string | null;
  companyId: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
};

type ChecklistItemDBResponse = {
  id: string;
  text: string;
  tipo_resposta: string;
  isRequired: boolean;
  options: string[] | null;
  hint: string | null;
  weight: number | null;
  parentQuestionId: string | null;
  conditionValue: string | null;
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  order: number;
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

      // Transform data from database format to our type
      const checklist: ChecklistDBResponse = {
        id: checklistData.id,
        title: checklistData.title,
        description: checklistData.description,
        isTemplate: checklistData.is_template,
        status: checklistData.status_checklist,
        category: checklistData.category,
        responsibleId: checklistData.responsible_id,
        companyId: checklistData.company_id,
        userId: checklistData.user_id,
        createdAt: checklistData.created_at,
        updatedAt: checklistData.updated_at,
        dueDate: checklistData.due_date
      };

      // Fetch checklist questions
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
          ordem
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

      // Transform questions from database format to our type
      const items: ChecklistItemDBResponse[] = (questionsData || []).map(item => ({
        id: item.id,
        text: item.pergunta,
        tipo_resposta: item.tipo_resposta,
        isRequired: item.obrigatorio,
        options: item.opcoes,
        hint: item.hint,
        weight: item.weight,
        parentQuestionId: item.parent_item_id,
        conditionValue: item.condition_value,
        allowsPhoto: item.permite_foto,
        allowsVideo: item.permite_video,
        allowsAudio: item.permite_audio,
        order: item.ordem,
      }));

      items.forEach((q) => {
        // Parse group info from hint field
        const { groupId, groupTitle } = parseGroupInfo(q.hint || undefined);
        
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
          hint: q.hint || undefined,
          weight: q.weight || 1,
          groupId: groupId,
          parentQuestionId: q.parentQuestionId || undefined,
          conditionValue: q.conditionValue || undefined,
          allowsPhoto: q.allowsPhoto,
          allowsVideo: q.allowsVideo,
          allowsAudio: q.allowsAudio,
          order: q.order
        });
      });

      // Convert groups map to array and sort by order
      const groups = Array.from(groupsMap.values())
        .sort((a, b) => a.order - b.order);

      const checklistWithStats: ChecklistWithStats = {
        id: checklist.id,
        title: checklist.title,
        description: checklist.description || undefined,
        isTemplate: checklist.isTemplate,
        status: (checklist.status || 'inactive') as 'active' | 'inactive',
        category: checklist.category || undefined,
        responsibleId: checklist.responsibleId || undefined,
        companyId: checklist.companyId || undefined,
        userId: checklist.userId || undefined,
        createdAt: checklist.createdAt,
        updatedAt: checklist.updatedAt,
        dueDate: checklist.dueDate || undefined,
        groups,
        questions: processedQuestions,
        totalQuestions: items.length,
        completedQuestions: 0 // In a real app, we'd calculate this
      };

      return checklistWithStats;
    },
    enabled: !!id && id !== "new",
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
}
