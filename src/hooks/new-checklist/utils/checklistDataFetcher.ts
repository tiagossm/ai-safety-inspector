
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { UiGroup, UiQuestion } from "@/types/editorTypes";
import { processGroupsFromItems } from "./groupProcessor";

interface FetchedChecklistData {
  checklistData: ChecklistWithStats | null;
  error: Error | null;
}

/**
 * Fetches checklist data and its items from Supabase
 */
export async function fetchChecklistData(id: string): Promise<FetchedChecklistData> {
  try {
    if (!id) {
      return {
        checklistData: null,
        error: new Error("Checklist ID is required")
      };
    }

    // Fetch checklist data with explicit relationship paths
    const { data: checklist, error: checklistError } = await supabase
      .from("checklists")
      .select(`
        *,
        companies:company_id(*),
        users:responsible_id(id, name, email)
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
    const { groups, questions } = processGroupsFromItems(processedItems);
    
    // Get user data from the users object with proper null check
    let responsibleName = "";
    // Use optional chaining and nullish coalescing for type safety
    if (checklist?.users && typeof checklist.users === 'object') {
      responsibleName = (checklist.users as any)?.name ?? "";
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

    return {
      checklistData,
      error: null
    };
  } catch (err) {
    console.error("Error fetching checklist:", err);
    return {
      checklistData: null,
      error: err instanceof Error ? err : new Error("Failed to fetch checklist")
    };
  }
}
