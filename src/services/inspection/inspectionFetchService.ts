
import { supabase } from "@/integrations/supabase/client";
import { processChecklistItems, processResponses } from "@/utils/inspection/normalizationUtils";
import { fetchAllSubChecklists } from "./subChecklistService";
import { toast } from "sonner";

/**
 * Fetches all data needed for an inspection
 */
export const fetchInspectionData = async (inspectionId: string) => {
  if (!inspectionId) {
    return {
      error: "ID da inspeção não fornecido",
      detailedError: null,
      inspection: null,
      questions: [],
      groups: [],
      responses: {},
      company: null,
      responsible: null,
      subChecklists: {},
    };
  }

  try {
    // Fetch inspection data
    const { data: inspectionData, error: inspectionError } = await supabase
      .from("inspections")
      .select(`*, companies:company_id(id, fantasy_name), checklist:checklist_id(id, title, description, category)`)
      .eq("id", inspectionId)
      .single();

    if (inspectionError || !inspectionData) {
      throw inspectionError || new Error("Inspeção não encontrada");
    }

    console.log("Inspection data loaded:", inspectionData);

    // Check if it's a subchecklist
    const isSubChecklist = inspectionData.checklist?.category === "subchecklist";
    if (isSubChecklist) {
      return {
        error: "Esta inspeção é um sub-checklist e não pode ser executada diretamente.",
        detailedError: null,
        inspection: null,
        questions: [],
        groups: [],
        responses: {},
        company: null,
        responsible: null,
        subChecklists: {},
      };
    }

    // Format inspection data
    const inspection = {
      id: inspectionData.id,
      title: inspectionData.checklist?.title,
      description: inspectionData.checklist?.description,
      checklistId: inspectionData.checklist_id,
      companyId: inspectionData.company_id,
      responsibleId: inspectionData.responsible_id,
      scheduledDate: inspectionData.scheduled_date,
      locationName: inspectionData.location,
      status: inspectionData.status || "pending",
    };

    const company = inspectionData.companies;

    // Fetch responsible user data
    let responsible = null;
    if (inspectionData.responsible_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("name")
        .eq("id", inspectionData.responsible_id)
        .single();
      if (userData) responsible = userData;
    }

    // Fetch checklist questions
    const { data: checklistItems, error: checklistError } = await supabase
      .from("checklist_itens")
      .select("*")
      .eq("checklist_id", inspectionData.checklist_id)
      .order("ordem", { ascending: true });

    if (checklistError) throw checklistError;
    
    console.log(`Loaded ${checklistItems?.length || 0} checklist items from Supabase`);

    if (!checklistItems || checklistItems.length === 0) {
      console.warn("No checklist items found for this inspection");
      toast.error("Nenhuma pergunta encontrada para esta inspeção");
    }

    // Process questions and groups
    const { parsedQuestions, groupsMap } = processChecklistItems(checklistItems);
    
    // Sort and configure groups
    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
    const finalGroups = sortedGroups.length > 0 ? sortedGroups : [{ id: "default-group", title: "Geral", order: 0 }];
    
    console.log(`Setting ${finalGroups.length} groups and ${parsedQuestions.length} questions`);

    // Fetch responses
    const { data: responsesData } = await supabase
      .from("inspection_responses")
      .select("*")
      .eq("inspection_id", inspectionId);

    const responses = processResponses(responsesData);

    // Fetch subchecklists
    const subChecklists = await fetchAllSubChecklists(parsedQuestions);

    return {
      error: null,
      detailedError: null,
      inspection,
      questions: parsedQuestions,
      groups: finalGroups,
      responses,
      company,
      responsible,
      subChecklists,
    };
  } catch (err: any) {
    console.error("Error fetching inspection data:", err);
    toast.error(`Erro ao carregar inspeção: ${err.message || "Erro desconhecido"}`);
    
    return {
      error: err.message || "Erro ao carregar inspeção",
      detailedError: JSON.stringify(err, null, 2),
      inspection: null,
      questions: [],
      groups: [],
      responses: {},
      company: null,
      responsible: null,
      subChecklists: {},
    };
  }
};
