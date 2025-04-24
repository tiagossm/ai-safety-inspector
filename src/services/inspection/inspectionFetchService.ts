
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeResponseType } from "@/utils/inspection/normalizationUtils";

/**
 * Processes checklist items into normalized format
 */
const processChecklistItems = (items) => {
  console.log(`Processing ${items?.length || 0} checklist items`);
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.warn("No checklist items to process");
    return { parsedQuestions: [], groupsMap: new Map() };
  }
  
  // Create a map for groups
  const groupsMap = new Map();
  groupsMap.set("default-group", { id: "default-group", title: "Geral", order: 0 });
  
  // Process questions
  const parsedQuestions = items.map((item, index) => {
    // Ensure each item has a groupId, using default-group if not present
    const groupId = item.group_id || "default-group";
    
    // Add the group to the map if it doesn't exist
    if (item.group_id && !groupsMap.has(item.group_id)) {
      groupsMap.set(item.group_id, {
        id: item.group_id,
        title: item.group_name || `Grupo ${groupsMap.size}`,
        order: groupsMap.size
      });
    }
    
    // Normalize options (if they exist)
    let options = [];
    if (item.opcoes) {
      try {
        if (typeof item.opcoes === 'string') {
          options = JSON.parse(item.opcoes);
        } else if (Array.isArray(item.opcoes)) {
          options = item.opcoes;
        } else if (typeof item.opcoes === 'object') {
          options = item.opcoes;
        }
      } catch (e) {
        console.warn(`Failed to parse options for question ${item.id}:`, e);
      }
    }
    
    // Create normalized question object
    return {
      id: item.id,
      text: item.pergunta,
      responseType: normalizeResponseType(item.tipo_resposta),
      isRequired: item.obrigatorio !== false,
      options: options,
      order: item.ordem || index,
      groupId: groupId,
      weight: item.weight || 1,
      allowsPhoto: item.permite_foto === true,
      allowsVideo: item.permite_video === true,
      allowsAudio: item.permite_audio === true,
      allowsFiles: item.permite_files === true,
      hint: item.hint || null,
      parentQuestionId: item.parent_item_id || null,
      conditionValue: item.condition_value || null,
      hasSubChecklist: item.has_subchecklist === true,
      subChecklistId: item.sub_checklist_id || null,
    };
  });
  
  console.log(`Processed ${parsedQuestions.length} questions with ${groupsMap.size} groups`);
  return { parsedQuestions, groupsMap };
};

/**
 * Processes inspection responses
 */
const processResponses = (responsesData) => {
  if (!responsesData || responsesData.length === 0) {
    return {};
  }
  
  const responses = {};
  responsesData.forEach(response => {
    responses[response.question_id] = {
      value: response.answer,
      comment: response.notes,
      actionPlan: response.action_plan,
      mediaUrls: response.media_urls || [],
      subChecklistResponses: response.sub_checklist_responses || {},
      updatedAt: response.updated_at
    };
  });
  
  return responses;
};

/**
 * Fetches all data needed for an inspection
 */
export async function fetchInspectionData(inspectionId) {
  console.log(`Fetching inspection data for ID: ${inspectionId}`);
  
  if (!inspectionId) {
    console.error("No inspection ID provided");
    return {
      error: "ID da inspeção não fornecido",
      detailedError: null,
      inspection: null,
      questions: [],
      groups: [{ id: "default-group", title: "Geral", order: 0 }],
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
      .select(`
        *, 
        companies:company_id(id, fantasy_name, cnpj),
        checklist:checklist_id(id, title, description)
      `)
      .eq("id", inspectionId)
      .single();

    if (inspectionError) {
      console.error("Error fetching inspection:", inspectionError);
      return {
        error: "Erro ao buscar inspeção: " + inspectionError.message,
        detailedError: inspectionError,
        inspection: null,
        questions: [],
        groups: [{ id: "default-group", title: "Geral", order: 0 }],
        responses: {},
        company: null,
        responsible: null,
        subChecklists: {},
      };
    }

    if (!inspectionData) {
      console.error("No inspection data found for ID:", inspectionId);
      return {
        error: "Inspeção não encontrada",
        detailedError: { message: "Nenhum dado encontrado para este ID de inspeção" },
        inspection: null,
        questions: [],
        groups: [{ id: "default-group", title: "Geral", order: 0 }],
        responses: {},
        company: null,
        responsible: null,
        subChecklists: {},
      };
    }

    console.log("Inspection data loaded:", inspectionData);

    // Format inspection data
    const inspection = {
      id: inspectionData.id,
      title: inspectionData.checklist?.title || "Inspeção sem título",
      description: inspectionData.checklist?.description || "",
      checklistId: inspectionData.checklist_id,
      companyId: inspectionData.company_id,
      responsibleId: inspectionData.responsible_id,
      scheduledDate: inspectionData.scheduled_date,
      locationName: inspectionData.location,
      status: inspectionData.status || "pending",
    };

    // Extract company information
    const company = inspectionData.companies ? {
      id: inspectionData.companies.id,
      fantasy_name: inspectionData.companies.fantasy_name,
      cnpj: inspectionData.companies.cnpj
    } : null;

    // Fetch responsible user data
    let responsible = null;
    if (inspectionData.responsible_id) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email, position")
        .eq("id", inspectionData.responsible_id)
        .single();
      
      if (userError) {
        console.warn("Error fetching responsible user:", userError);
      } else if (userData) {
        responsible = userData;
      }
    }

    // Handle case where there's no checklist_id
    if (!inspectionData.checklist_id) {
      console.error("Inspection has no checklist_id:", inspectionId);
      return {
        error: "Inspeção não possui um checklist associado",
        detailedError: { message: "checklist_id não encontrado na inspeção" },
        inspection,
        questions: [],
        groups: [{ id: "default-group", title: "Geral", order: 0 }],
        responses: {},
        company,
        responsible,
        subChecklists: {},
      };
    }

    // Fetch checklist items
    const { data: checklistItems, error: checklistError } = await supabase
      .from("checklist_itens")
      .select("*")
      .eq("checklist_id", inspectionData.checklist_id)
      .order("ordem", { ascending: true });

    if (checklistError) {
      console.error("Error fetching checklist items:", checklistError);
      return {
        error: "Erro ao buscar perguntas do checklist: " + checklistError.message,
        detailedError: checklistError,
        inspection,
        questions: [],
        groups: [{ id: "default-group", title: "Geral", order: 0 }],
        responses: {},
        company,
        responsible,
        subChecklists: {},
      };
    }

    console.log(`Loaded ${checklistItems?.length || 0} checklist items from database`);

    // Process questions and groups
    const { parsedQuestions, groupsMap } = processChecklistItems(checklistItems);
    
    // Convert groups map to sorted array
    const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
    
    // Log for debugging
    console.log(`Processed ${parsedQuestions.length} questions with ${groups.length} groups`);
    if (parsedQuestions.length > 0) {
      // Check group distribution
      const groupDistribution = parsedQuestions.reduce((acc, q) => {
        const grp = q.groupId || "undefined";
        acc[grp] = (acc[grp] || 0) + 1;
        return acc;
      }, {});
      
      console.log("Questions per group:", groupDistribution);
    }

    // Fetch responses
    const { data: responsesData, error: responsesError } = await supabase
      .from("inspection_responses")
      .select("*")
      .eq("inspection_id", inspectionId);

    if (responsesError) {
      console.warn("Error fetching responses:", responsesError);
    }

    const responses = processResponses(responsesData || []);
    
    // Simplified subchecklist data for now
    const subChecklists = {};

    return {
      error: null,
      detailedError: null,
      inspection,
      questions: parsedQuestions,
      groups,
      responses,
      company,
      responsible,
      subChecklists,
    };
  } catch (err) {
    console.error("Error in fetchInspectionData:", err);
    
    return {
      error: err.message || "Erro ao carregar inspeção",
      detailedError: err,
      inspection: null,
      questions: [],
      groups: [{ id: "default-group", title: "Geral", order: 0 }],
      responses: {},
      company: null,
      responsible: null,
      subChecklists: {},
    };
  }
}
