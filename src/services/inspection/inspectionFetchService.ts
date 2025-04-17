
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Normaliza o tipo de resposta para um formato padrão
 */
const normalizeResponseType = (type) => {
  if (!type) return "text";
  
  const typeStr = String(type).toLowerCase();
  if (typeStr.includes("sim") || typeStr.includes("não") || typeStr.includes("yes") || typeStr.includes("no")) {
    return "yes_no";
  } else if (typeStr.includes("múlt") || typeStr.includes("mult")) {
    return "multiple_choice";
  } else if (typeStr.includes("num")) {
    return "numeric";
  } else if (typeStr.includes("foto") || typeStr.includes("image") || typeStr.includes("photo")) {
    return "photo";
  }
  return "text";
};

/**
 * Processa os itens do checklist para o formato necessário
 */
const processChecklistItems = (items) => {
  console.log(`Processing ${items?.length || 0} checklist items`);
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.warn("No checklist items to process");
    return { parsedQuestions: [], groupsMap: new Map() };
  }
  
  // Criar um mapa para os grupos
  const groupsMap = new Map();
  groupsMap.set("default-group", { id: "default-group", title: "Geral", order: 0 });
  
  // Processar as questões
  const parsedQuestions = items.map((item, index) => {
    // Garantir que cada item tenha um groupId, usando default-group se não tiver
    const groupId = item.group_id || "default-group";
    
    // Adicionar o grupo ao mapa se não existir
    if (item.group_id && !groupsMap.has(item.group_id)) {
      groupsMap.set(item.group_id, {
        id: item.group_id,
        title: item.group_name || `Grupo ${groupsMap.size}`,
        order: groupsMap.size
      });
    }
    
    // Normalizar as opções (se existirem)
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
    
    // Criar objeto de questão normalizado
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
  
  console.log(`Parsed ${parsedQuestions.length} questions with ${groupsMap.size} groups`);
  return { parsedQuestions, groupsMap };
};

/**
 * Processa as respostas da inspeção
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
 * Busca todos os dados necessários para uma inspeção
 */
export const fetchInspectionData = async (inspectionId) => {
  console.log(`Fetching inspection data for ID: ${inspectionId}`);
  
  if (!inspectionId) {
    console.error("No inspection ID provided");
    return {
      error: "ID da inspeção não fornecido",
      detailedError: null, // Adicionamos a propriedade detailedError
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
    // Buscar dados da inspeção
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
        detailedError: inspectionError, // Armazenamos o erro detalhado
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

    // Formatar dados da inspeção
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

    // Extrair informações da empresa
    const company = inspectionData.companies ? {
      id: inspectionData.companies.id,
      fantasy_name: inspectionData.companies.fantasy_name,
      cnpj: inspectionData.companies.cnpj
    } : null;

    // Buscar dados do responsável
    let responsible = null;
    if (inspectionData.responsible_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("id, name, email, position")
        .eq("id", inspectionData.responsible_id)
        .single();
      
      if (userData) {
        responsible = userData;
      }
    }

    // Buscar itens do checklist
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

    // Processar questões e grupos
    const { parsedQuestions, groupsMap } = processChecklistItems(checklistItems);
    
    // Converter mapa de grupos para array ordenado
    const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
    
    // Log para debug
    console.log(`Processed ${parsedQuestions.length} questions with ${groups.length} groups`);
    if (parsedQuestions.length > 0) {
      // Verificar distribuição de grupos
      const groupDistribution = parsedQuestions.reduce((acc, q) => {
        const grp = q.groupId || "undefined";
        acc[grp] = (acc[grp] || 0) + 1;
        return acc;
      }, {});
      
      console.log("Questions per group:", groupDistribution);
    }

    // Buscar respostas
    const { data: responsesData } = await supabase
      .from("inspection_responses")
      .select("*")
      .eq("inspection_id", inspectionId);

    const responses = processResponses(responsesData);
    
    // Dados de subchecklists simplificados por enquanto
    const subChecklists = {};

    return {
      error: null,
      detailedError: null, // Não há erro detalhado quando tudo corre bem
      inspection,
      questions: parsedQuestions,
      groups,
      responses,
      company,
      responsible,
      subChecklists,
    };
  } catch (err) {
    console.error("Error fetching inspection data:", err);
    toast.error(`Erro ao carregar inspeção: ${err.message || "Erro desconhecido"}`);
    
    return {
      error: err.message || "Erro ao carregar inspeção",
      detailedError: err, // Armazenamos o erro completo
      inspection: null,
      questions: [],
      groups: [{ id: "default-group", title: "Geral", order: 0 }],
      responses: {},
      company: null,
      responsible: null,
      subChecklists: {},
    };
  }
};
