
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistGroup, ChecklistQuestion } from "@/types/newChecklist";
import { initializeInspectionsSchema } from "@/utils/initializeDatabase";

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
    "yes_no": "yes_no",
    "multiple_choice": "multiple_choice",
    "text": "text",
    "numeric": "numeric",
    "photo": "photo",
    "signature": "signature",
    "sim/não": "yes_no",
    "seleção múltipla": "multiple_choice",
    "texto": "text",
    "numérico": "numeric",
    "foto": "photo",
    "assinatura": "signature"
  };
  return typeMap[dbType.toLowerCase()] || "text";
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

      // Initialize the database schema to ensure required columns exist
      await initializeInspectionsSchema();

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

      try {
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
        console.log("Processing questions:", questionsData?.length || 0);

        const groupsMap = new Map<string, ChecklistGroup>();
        const processedQuestions: ChecklistQuestion[] = [];

        // Primeiro, vamos identificar grupos existentes para garantir que todas as perguntas sejam mapeadas corretamente
        if (questionsData?.length > 0) {
          // Criar um grupo padrão se não houver nenhum explícito
          let defaultGroupId: string | null = null;
          
          // Processar informações de grupos primeiro
          for (const q of questionsData) {
            const { groupId, groupTitle } = parseGroupInfo(q.hint || undefined);
            
            if (groupId && groupTitle && !groupsMap.has(groupId)) {
              groupsMap.set(groupId, {
                id: groupId,
                title: groupTitle,
                order: groupsMap.size
              });
            }
          }
          
          // Se não encontramos grupos, criar um padrão
          if (groupsMap.size === 0 && questionsData.length > 0) {
            defaultGroupId = "default-group";
            groupsMap.set(defaultGroupId, {
              id: defaultGroupId,
              title: "Geral",
              order: 0
            });
          }
          
          // Agora processar todas as perguntas
          for (const q of questionsData) {
            let questionGroupId: string | undefined;
            
            // Tentar extrair groupId do hint
            const { groupId } = parseGroupInfo(q.hint || undefined);
            
            if (groupId && groupsMap.has(groupId)) {
              questionGroupId = groupId;
            } else if (defaultGroupId) {
              // Se não tem grupo mas temos um padrão, usar o padrão
              questionGroupId = defaultGroupId;
            }
            
            let options: string[] | undefined;
            
            // Processar opções
            if (q.opcoes) {
              if (Array.isArray(q.opcoes)) {
                options = q.opcoes.map(String);
              } else if (typeof q.opcoes === "string") {
                try {
                  const parsed = JSON.parse(q.opcoes);
                  options = Array.isArray(parsed) ? parsed.map(String) : [q.opcoes];
                } catch (e) {
                  options = [q.opcoes];
                }
              }
            }
            
            processedQuestions.push({
              id: q.id,
              text: q.pergunta,
              responseType: mapResponseType(q.tipo_resposta),
              isRequired: q.obrigatorio,
              options,
              hint: q.hint || undefined,
              weight: q.weight || 1,
              groupId: questionGroupId,
              parentQuestionId: q.parent_item_id || undefined,
              conditionValue: q.condition_value || undefined,
              allowsPhoto: q.permite_foto || false,
              allowsVideo: q.permite_video || false,
              allowsAudio: q.permite_audio || false,
              order: q.ordem || processedQuestions.length,
              hasSubChecklist: !!q.sub_checklist_id,
              subChecklistId: q.sub_checklist_id || undefined
            });
          }
        }

        const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
        console.log("Processing questions:", processedQuestions.length);
        console.log("Processing groups:", groups.length);

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
          totalQuestions: processedQuestions.length,
          completedQuestions: 0
        };

        return checklistWithStats;
      } catch (err) {
        // If there's an error related to missing columns, initialize the schema
        console.error("Error processing checklist data:", err);
        await initializeInspectionsSchema();
        throw new Error("Erro ao processar dados do checklist. Por favor, tente novamente.");
      }
    },
    enabled: !!id && id !== "new" && id !== "editor",
    staleTime: 60000,
    gcTime: 300000
  });
}
