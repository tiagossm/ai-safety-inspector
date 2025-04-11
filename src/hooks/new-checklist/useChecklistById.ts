
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { UiGroup, UiQuestion } from "@/types/editorTypes";

interface UseChecklistByIdResult {
  data: ChecklistWithStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useChecklistById(id: string): UseChecklistByIdResult {
  const [data, setData] = useState<ChecklistWithStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!id) {
      setError(new Error("Checklist ID is required"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch checklist data with explicit relationship paths to avoid ambiguity
      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .select(`
          *,
          companies:company_id(*),
          users:responsible_id(*)
        `)
        .eq("id", id)
        .single();

      if (checklistError) {
        throw checklistError;
      }

      // Fetch checklist items
      const { data: questionItems, error: questionsError } = await supabase
        .from("checklist_itens")
        .select(`*`)
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (questionsError) {
        throw questionsError;
      }

      // Process questions to get groups
      const processedItems = questionItems || [];
      const groups: UiGroup[] = [];
      const questions: UiQuestion[] = [];
      
      // First pass: extract group information from hints
      processedItems.forEach(item => {
        let groupId = null;
        let groupTitle = "General";
        
        try {
          if (item.hint) {
            const hintData = JSON.parse(item.hint);
            if (hintData && hintData.groupId) {
              groupId = hintData.groupId;
              groupTitle = hintData.groupTitle || "General";
              
              // Add group if it doesn't exist
              if (!groups.some(g => g.id === groupId)) {
                groups.push({
                  id: groupId,
                  title: groupTitle,
                  order: hintData.groupIndex || 0,
                  questions: []
                });
              }
            }
          }
        } catch (e) {
          console.error("Error parsing hint:", e);
        }
        
        // Convert opcoes to string array if it exists
        let options: string[] = [];
        if (item.opcoes) {
          try {
            if (Array.isArray(item.opcoes)) {
              // Convert each item to string, even if they might be numbers or other types
              options = item.opcoes.map(opt => String(opt));
            }
          } catch (e) {
            console.error("Error processing options:", e);
            options = [];
          }
        }
        
        const question: UiQuestion = {
          id: item.id,
          text: item.pergunta,
          responseType: item.tipo_resposta, 
          order: item.ordem,
          isRequired: item.obrigatorio,
          groupId: groupId,
          allowsPhoto: item.permite_foto,
          allowsVideo: item.permite_video,
          allowsAudio: item.permite_audio,
          options: options,
          weight: item.weight || 1,
          parentId: item.parent_item_id,
          conditionValue: item.condition_value,
          hasSubChecklist: item.has_subchecklist || false,
          subChecklistId: item.sub_checklist_id || null
        };
        
        questions.push(question);
      });
      
      // Sort groups by their order
      groups.sort((a, b) => a.order - b.order);
      
      // If no groups were found but there are questions, create a default group
      if (groups.length === 0 && questions.length > 0) {
        const defaultGroup: UiGroup = {
          id: "default",
          title: "General",
          order: 0,
          questions: []
        };
        groups.push(defaultGroup);
      }
      
      // Get user data from the users object
      let responsibleName = "";
      if (checklist.users) {
        // Extract name from users object, ensuring we handle it as a possibly null value
        responsibleName = checklist.users.name || "";
      }
      
      // Prepare checklist data
      const checklistData: ChecklistWithStats = {
        id: checklist.id,
        title: checklist.title,
        description: checklist.description || "",
        isTemplate: checklist.is_template,
        is_template: checklist.is_template,
        status: checklist.status || "active",
        category: checklist.category || "",
        origin: checklist.origin || "manual",
        responsibleId: checklist.responsible_id || "",
        companyId: checklist.company_id || "",
        userId: checklist.user_id || "",
        createdAt: checklist.created_at,
        updatedAt: checklist.updated_at,
        dueDate: checklist.due_date,
        isSubChecklist: checklist.is_sub_checklist || false,
        totalQuestions: questions.length,
        companyName: checklist.companies?.fantasy_name || "",
        responsibleName: responsibleName,
        questions: questions,
        groups: groups
      };

      setData(checklistData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching checklist:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch checklist"));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, loading, error, refetch: fetchData };
}
