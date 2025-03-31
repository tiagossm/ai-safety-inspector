
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

export function useChecklistById(id: string) {
  return useQuery({
    queryKey: ["new-checklist", id],
    queryFn: async (): Promise<ChecklistWithStats | null> => {
      if (!id) return null;

      console.log("Fetching checklist with ID:", id);

      try {
        // Fetch the main checklist data
        const { data: checklist, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", id)
          .single();

        if (checklistError) {
          console.error("Error fetching checklist:", checklistError);
          throw checklistError;
        }

        if (!checklist) {
          console.error("Checklist not found with ID:", id);
          throw new Error("Checklist not found");
        }

        // Fetch the checklist questions
        const { data: questions, error: questionsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", id)
          .order("ordem", { ascending: true });

        if (questionsError) {
          console.error("Error fetching checklist questions:", questionsError);
          throw questionsError;
        }

        console.log(`Retrieved ${questions?.length || 0} questions for checklist ${id}`);

        // Process the questions to extract groups
        const groupMap = new Map<string, ChecklistGroup>();
        const normalizedQuestions: ChecklistQuestion[] = [];

        // Helper function to extract group info from hint
        const extractGroupInfo = (hint: string | null): { 
          groupId: string; 
          groupTitle: string; 
          groupIndex: number 
        } | null => {
          if (!hint) return null;

          try {
            const parsedHint = JSON.parse(hint);
            if (parsedHint.groupId && parsedHint.groupTitle) {
              return {
                groupId: parsedHint.groupId,
                groupTitle: parsedHint.groupTitle,
                groupIndex: parsedHint.groupIndex || 0
              };
            }
          } catch (e) {
            return null;
          }

          return null;
        };

        // Process each question to normalize and extract group info
        questions?.forEach((q, index) => {
          const groupInfo = extractGroupInfo(q.hint);
          let groupId = "default";
          
          if (groupInfo) {
            groupId = groupInfo.groupId;
            
            // Add group to groupMap if not exists
            if (!groupMap.has(groupId)) {
              groupMap.set(groupId, {
                id: groupId,
                title: groupInfo.groupTitle,
                order: groupInfo.groupIndex
              });
            }
          }

          // Check if this question has a sub-checklist
          const hasSubChecklist = q.has_subchecklist || false;
          const subChecklistId = q.subchecklist_id || null;

          // For backward compatibility and consistency
          const responseType = (() => {
            switch (q.tipo_resposta) {
              case "sim/não": return "yes_no";
              case "texto": return "text";
              case "numérico": return "numeric";
              case "seleção múltipla": return "multiple_choice";
              case "foto": return "photo";
              case "assinatura": return "signature";
              default: return "yes_no";
            }
          })();

          // Convert options to array if it's not already
          let options: string[] | undefined = undefined;
          if (q.opcoes) {
            if (Array.isArray(q.opcoes)) {
              options = q.opcoes;
            } else if (typeof q.opcoes === 'string') {
              try {
                options = JSON.parse(q.opcoes);
              } catch (e) {
                // If parse fails, treat as a single option
                options = [String(q.opcoes)];
              }
            } else {
              // For any other case, convert to string array
              options = [String(q.opcoes)];
            }
          }

          // Add normalized question
          normalizedQuestions.push({
            id: q.id,
            text: q.pergunta,
            responseType: responseType,
            isRequired: q.obrigatorio,
            weight: q.weight || 1,
            options: options,
            hint: q.hint,
            groupId,
            parentQuestionId: q.parent_item_id,
            conditionValue: q.condition_value,
            allowsPhoto: q.permite_foto || false,
            allowsVideo: q.permite_video || false,
            allowsAudio: q.permite_audio || false,
            order: q.ordem || index,
            hasSubChecklist,
            subChecklistId
          });
        });

        // Convert group map to array and sort by order
        const groups = Array.from(groupMap.values()).sort((a, b) => a.order - b.order);

        // If no groups defined but we have questions, create a default group
        if (groups.length === 0 && normalizedQuestions.length > 0) {
          groups.push({
            id: "default",
            title: "Geral",
            order: 0
          });
          
          // Assign all questions to the default group
          normalizedQuestions.forEach(q => {
            if (!q.groupId) {
              q.groupId = "default";
            }
          });
        }

        console.log(`Processing questions: ${normalizedQuestions.length}`);
        console.log(`Processing groups: ${groups.length}`);

        // Build the final checklist with stats
        const checklistWithStats: ChecklistWithStats = {
          id: checklist.id,
          title: checklist.title,
          description: checklist.description,
          isTemplate: checklist.is_template,
          status: checklist.status_checklist === "ativo" ? "active" : "inactive",
          category: checklist.category,
          responsibleId: checklist.responsible_id,
          companyId: checklist.company_id,
          userId: checklist.user_id,
          createdAt: checklist.created_at,
          updatedAt: checklist.updated_at,
          dueDate: checklist.due_date,
          groups,
          questions: normalizedQuestions,
          totalQuestions: normalizedQuestions.length,
          completedQuestions: 0,
          // Support for both camelCase and snake_case
          created_at: checklist.created_at,
          updated_at: checklist.updated_at,
          isSubChecklist: checklist.is_sub_checklist,
          is_sub_checklist: checklist.is_sub_checklist
        };

        return checklistWithStats;
      } catch (error) {
        console.error("Error in useChecklistById:", error);
        toast.error(`Erro ao carregar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
