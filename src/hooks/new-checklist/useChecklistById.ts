
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";

export function useChecklistById(checklistId: string) {
  const [checklist, setChecklist] = useState<ChecklistWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the checklist details
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select(`
            *,
            companies:company_id (id, fantasy_name)
          `)
          .eq("id", checklistId)
          .single();

        if (checklistError) {
          throw checklistError;
        }

        if (!checklistData) {
          throw new Error("Checklist not found");
        }

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("ordem", { ascending: true });

        if (questionsError) {
          console.error("Error fetching questions:", questionsError);
          toast.error("Error loading checklist questions");
        }

        // Transform questions to match expected format
        const questions: ChecklistQuestion[] = (questionsData || []).map(item => ({
          id: item.id,
          text: item.pergunta,
          responseType: item.tipo_resposta as "yes_no" | "numeric" | "text" | "multiple_choice" | "photo" | "signature",
          isRequired: item.obrigatorio,
          options: item.opcoes as string[] || [],
          order: item.ordem,
          allowsPhoto: item.permite_foto,
          allowsVideo: item.permite_video,
          allowsAudio: item.permite_audio,
          weight: item.weight || 1,
          parentId: item.parent_item_id,
          parentQuestionId: item.parent_item_id,
          conditionValue: item.condition_value,
          displayNumber: `${item.ordem + 1}`,
          hint: item.hint,
          hasSubChecklist: item.has_subchecklist,
          subChecklistId: item.sub_checklist_id
        }));

        // Extract group data from question hints
        const groupsMap = new Map<string, ChecklistGroup>();
        questions.forEach(q => {
          try {
            if (q.hint && q.hint.startsWith("{")) {
              const hintData = JSON.parse(q.hint);
              if (hintData.groupId && hintData.groupTitle) {
                if (!groupsMap.has(hintData.groupId)) {
                  groupsMap.set(hintData.groupId, {
                    id: hintData.groupId,
                    title: hintData.groupTitle,
                    order: hintData.groupIndex || 0,
                    description: ""
                  });
                }
              }
            }
          } catch (e) {
            // Invalid JSON in hint, ignore
          }
        });

        // Convert the checklist data to the required format
        const formattedChecklist: ChecklistWithStats = {
          id: checklistData.id,
          title: checklistData.title,
          description: checklistData.description || "",
          is_template: checklistData.is_template || false,
          status: checklistData.status as "active" | "inactive",
          category: checklistData.category || "",
          responsible_id: checklistData.responsible_id,
          company_id: checklistData.company_id,
          user_id: checklistData.user_id,
          created_at: checklistData.created_at,
          updated_at: checklistData.updated_at,
          due_date: checklistData.due_date,
          is_sub_checklist: checklistData.is_sub_checklist || false,
          origin: checklistData.origin as "manual" | "ia" | "csv",
          parent_question_id: checklistData.parent_question_id,
          totalQuestions: questions.length,
          completedQuestions: 0,
          companyName: checklistData.companies?.fantasy_name,
          questions,
          groups: Array.from(groupsMap.values()),
          
          // Backward compatibility fields
          isTemplate: checklistData.is_template || false,
          isSubChecklist: checklistData.is_sub_checklist || false,
          companyId: checklistData.company_id,
          responsibleId: checklistData.responsible_id,
          userId: checklistData.user_id,
          createdAt: checklistData.created_at,
          updatedAt: checklistData.updated_at,
          dueDate: checklistData.due_date,
          responsibleName: ""
        };

        setChecklist(formattedChecklist);
      } catch (err: any) {
        console.error("Error loading checklist:", err);
        setError(err);
        toast.error(`Error loading checklist: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    if (checklistId) {
      fetchChecklist();
    } else {
      setLoading(false);
      setError(new Error("No checklist ID provided"));
    }
  }, [checklistId]);

  return { checklist, loading, error, setChecklist };
}
