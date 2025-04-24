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
    };
  });

  return { parsedQuestions, groupsMap };
};

const processResponses = (responsesData) => {
  if (!responsesData || responsesData.length === 0) return {};

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
      subChecklists: {},
    };
  }

  try {
    const { data: inspectionData, error: inspectionError } = await supabase
      .from("inspections")
      .select(`*, companies:company_id(id, fantasy_name, cnpj)`) // Removido join com checklist
      .eq("id", inspectionId)
      .single();

    if (inspectionError || !inspectionData) {
      return {
        error: "Erro ao buscar inspeção",
        detailedError: inspectionError || { message: "Inspeção não encontrada" },
        inspection: null,
        questions: [],
        groups: [{ id: "default-group", title: "Geral", order: 0 }],
        responses: {},
        company: null,
        responsible: null,
        subChecklists: {},
      };
    }

    const checklistRes = await supabase
      .from("checklists")
      .select("id, title, description")
      .eq("id", inspectionData.checklist_id)
      .maybeSingle();

    const inspection = {
      id: inspectionData.id,
      title: checklistRes?.data?.title || "Inspeção sem título",
      description: checklistRes?.data?.description || "",
      checklistId: inspectionData.checklist_id,
      companyId: inspectionData.company_id,
      responsibleId: inspectionData.responsible_id,
      scheduledDate: inspectionData.scheduled_date,
      locationName: inspectionData.location,
      status: inspectionData.status || "pending",
    };

    const company = inspectionData.companies || null;

    let responsible = null;
    if (inspectionData.responsible_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("id, name, email, position")
        .eq("id", inspectionData.responsible_id)
        .single();

      responsible = userData || null;
    }

    const { data: checklistItems, error: checklistError } = await supabase
      .from("checklist_itens")
      .select("*")
      .eq("checklist_id", inspectionData.checklist_id)
      .order("ordem", { ascending: true });

    if (checklistError) throw checklistError;

    const { parsedQuestions, groupsMap } = processChecklistItems(checklistItems);
    const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);

    const { data: responsesData } = await supabase
      .from("inspection_responses")
      .select("*")
      .eq("inspection_id", inspectionId);

    const responses = processResponses(responsesData || []);

    return {
      error: null,
      detailedError: null,
      inspection,
      questions: parsedQuestions,
      groups,
      responses,
      company,
      responsible,
      subChecklists: {},
    };
  } catch (err) {
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
