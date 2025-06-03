
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeResponseType } from "@/utils/inspection/normalizationUtils";

const processChecklistItems = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { parsedQuestions: [], groupsMap: new Map() };
  }

  const groupsMap = new Map();
  groupsMap.set("default-group", { id: "default-group", title: "Geral", order: 0 });

  const parsedQuestions = items.map((item, index) => {
    const groupId = item.group_id || "default-group";

    if (item.group_id && !groupsMap.has(item.group_id)) {
      groupsMap.set(item.group_id, {
        id: item.group_id,
        title: item.group_name || `Grupo ${groupsMap.size}`,
        order: groupsMap.size
      });
    }

    let options = [];
    try {
      if (typeof item.opcoes === 'string') {
        options = JSON.parse(item.opcoes);
      } else if (Array.isArray(item.opcoes)) {
        options = item.opcoes;
      } else if (typeof item.opcoes === 'object') {
        options = item.opcoes;
      }
    } catch (e) {
      console.warn(`Erro ao processar opções da pergunta ${item.id}:`, e);
    }

    return {
      id: item.id,
      text: item.pergunta,
      responseType: normalizeResponseType(item.tipo_resposta),
      isRequired: item.obrigatorio !== false,
      options,
      order: item.ordem || index,
      groupId,
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
      level: item.level || 0,
      path: item.path || null,
      displayCondition: item.display_condition || null,
      isConditional: item.is_conditional || false,
    };
  });

  return { parsedQuestions, groupsMap };
};

const processResponses = (responsesData) => {
  if (!responsesData || responsesData.length === 0) return {};

  const responses = {};
  responsesData.forEach(response => {
    responses[response.checklist_item_id] = {
      value: typeof response.answer === 'string' ? response.answer : 
             response.answer && typeof response.answer === 'object' ? 
             JSON.stringify(response.answer) : response.answer,
      comment: response.comments || response.notes,
      actionPlan: response.action_plan,
      mediaUrls: response.media_urls || [],
      subChecklistResponses: response.sub_checklist_responses || {},
      updatedAt: response.updated_at,
      parentResponseId: response.parent_response_id
    };
  });

  return responses;
};

export async function fetchInspectionData(inspectionId) {
  if (!inspectionId) {
    return {
      error: "ID da inspeção não fornecido",
      detailedError: null,
      inspection: null,
      questions: [],
      groups: [{ id: "default-group", title: "Geral", order: 0 }],
      responses: {},
      company: null,
      responsible: null,
      responsibles: [],
      subChecklists: {},
    };
  }

  try {
    console.log(`Fetching inspection data for ID: ${inspectionId}`);
    
    const { data: inspectionData, error: inspectionError } = await supabase
      .from("inspections")
      .select(`
        id, 
        status,
        checklist_id,
        company_id,
        responsible_ids,
        responsible_id,
        scheduled_date,
        location,
        inspection_type,
        priority,
        metadata,
        companies:company_id(id, fantasy_name, cnpj, address)
      `)
      .eq("id", inspectionId)
      .single();

    if (inspectionError || !inspectionData) {
      console.error("Error fetching inspection:", inspectionError);
      return {
        error: "Erro ao buscar inspeção",
        detailedError: inspectionError || { message: "Inspeção não encontrada" },
        inspection: null,
        questions: [],
        groups: [{ id: "default-group", title: "Geral", order: 0 }],
        responses: {},
        company: null,
        responsible: null,
        responsibles: [],
        subChecklists: {},
      };
    }

    console.log("Loaded inspection data:", inspectionData);

    if (!inspectionData.checklist_id) {
      console.error("No checklist_id found in inspection data");
      return {
        error: "ID do checklist não encontrado na inspeção",
        detailedError: { message: "Nenhum checklist associado a esta inspeção" },
        inspection: inspectionData,
        questions: [],
        groups: [{ id: "default-group", title: "Geral", order: 0 }],
        responses: {},
        company: inspectionData.companies,
        responsible: null,
        responsibles: [],
        subChecklists: {},
      };
    }

    const checklistRes = await supabase
      .from("checklists")
      .select("id, title, description")
      .eq("id", inspectionData.checklist_id)
      .maybeSingle();

    console.log("Checklist data:", checklistRes.data);

    // Process metadata with type safety
    let metadataObj = {};
    let notesFromMeta = '';
    let coordinatesFromMeta = { latitude: 0, longitude: 0 };
    
    try {
      if (inspectionData.metadata) {
        if (typeof inspectionData.metadata === 'string') {
          metadataObj = JSON.parse(inspectionData.metadata);
        } else {
          metadataObj = inspectionData.metadata;
        }
        
        if (metadataObj && typeof metadataObj === 'object') {
          // Extract notes
          if ('notes' in metadataObj && typeof metadataObj.notes === 'string') {
            notesFromMeta = metadataObj.notes;
          }
          
          // Extract coordinates
          if ('coordinates' in metadataObj && 
              typeof metadataObj.coordinates === 'object' && 
              metadataObj.coordinates !== null) {
            const coords = metadataObj.coordinates;
            if ('latitude' in coords && typeof coords.latitude === 'number' && 
                'longitude' in coords && typeof coords.longitude === 'number') {
              coordinatesFromMeta = {
                latitude: coords.latitude,
                longitude: coords.longitude
              };
            }
          }
        }
      }
    } catch (e) {
      console.error("Error processing inspection metadata:", e);
    }
    
    const inspection = {
      id: inspectionData.id,
      title: checklistRes?.data?.title || "Inspeção sem título",
      description: checklistRes?.data?.description || "",
      checklistId: inspectionData.checklist_id,
      companyId: inspectionData.company_id,
      responsibleId: inspectionData.responsible_id,
      responsibleIds: inspectionData.responsible_ids || (inspectionData.responsible_id ? [inspectionData.responsible_id] : []),
      scheduledDate: inspectionData.scheduled_date,
      locationName: inspectionData.location,
      status: inspectionData.status || "pending",
      notes: notesFromMeta,
      coordinates: coordinatesFromMeta,
      inspectionType: inspectionData.inspection_type,
      priority: inspectionData.priority || "medium",
    };

    const company = inspectionData.companies || null;

    // Get responsible users data
    let responsible = null;
    let responsibles = [];
    
    if (inspection.responsibleIds && inspection.responsibleIds.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("id, name, email, position")
        .in("id", inspection.responsibleIds);

      responsibles = usersData || [];
      responsible = responsibles[0] || null;
    } 
    else if (inspectionData.responsible_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("id, name, email, position")
        .eq("id", inspectionData.responsible_id)
        .single();

      responsible = userData || null;
      responsibles = responsible ? [responsible] : [];
    }

    console.log(`Fetching checklist items using tree function for checklist: ${inspectionData.checklist_id}`);

    // Use the new tree function to load the hierarchical checklist items
    const { data: checklistItems, error: checklistError } = await supabase
      .rpc("get_checklist_tree", { checklist_id_param: inspectionData.checklist_id });

    if (checklistError) {
      console.error("Error fetching checklist tree:", checklistError);
      throw checklistError;
    }

    console.log(`Found ${checklistItems?.length || 0} checklist items (hierarchical)`);

    const { parsedQuestions, groupsMap } = processChecklistItems(checklistItems);
    const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);

    // Load responses for this inspection using the new table
    const { data: responsesData } = await supabase
      .from("checklist_item_responses")
      .select("*")
      .eq("inspection_id", inspectionId);

    console.log(`Found ${responsesData?.length || 0} responses`);

    const responses = processResponses(responsesData || []);

    // Load sub-checklists if any questions have them
    const subChecklistIds = parsedQuestions
      .filter(q => q.hasSubChecklist && q.subChecklistId)
      .map(q => q.subChecklistId);
    
    const subChecklists = {};
    
    if (subChecklistIds.length > 0) {
      const { data: subChecklistsData } = await supabase
        .from("checklists")
        .select("id, title, description")
        .in("id", subChecklistIds);
        
      if (subChecklistsData) {
        for (const subChecklist of subChecklistsData) {
          subChecklists[subChecklist.id] = {
            ...subChecklist,
            questions: [], // Will be populated if needed
            loaded: false
          };
        }
      }
    }

    return {
      error: null,
      detailedError: null,
      inspection,
      questions: parsedQuestions,
      groups,
      responses,
      company,
      responsible,
      responsibles,
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
      responsibles: [],
      subChecklists: {},
    };
  }
}
