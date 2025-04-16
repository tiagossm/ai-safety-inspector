
import { toast } from "sonner";

/**
 * Normalizes response type to a consistent format
 */
export const normalizeResponseType = (tipo: string): string => {
  if (!tipo) return "text";
  
  switch (tipo.toLowerCase()) {
    case "sim/não":
    case "sim/nao":
    case "yes_no":
      return "yes_no";
    case "texto":
    case "text":
      return "text";
    case "número":
    case "number":
      return "number";
    case "múltipla escolha":
    case "multiple_choice":
      return "multiple_choice";
    default:
      return tipo || "text";
  }
};

/**
 * Processes checklist items to normalize data
 */
export const processChecklistItems = (
  checklistItems: any[] | null, 
  defaultGroupId: string = "default-group"
) => {
  if (!checklistItems || checklistItems.length === 0) {
    console.warn("No checklist items found for processing");
    return { parsedQuestions: [], groupsMap: new Map() };
  }
  
  console.log(`Processing ${checklistItems.length} checklist items`);
  
  const DEFAULT_GROUP = { id: defaultGroupId, title: "Geral", order: 0 };
  const groupsMap = new Map<string, any>();
  groupsMap.set(DEFAULT_GROUP.id, DEFAULT_GROUP);

  const parsedQuestions = checklistItems.map((item: any) => {
    let groupId = DEFAULT_GROUP.id;
    let hint = null;

    try {
      // Parse hint if it's a string
      if (typeof item.hint === "string" && item.hint) {
        try {
          hint = JSON.parse(item.hint);
        } catch (e) {
          hint = { text: item.hint };
          console.warn(`Failed to parse hint as JSON for item ${item.id}:`, e);
        }
      } else if (item.hint && typeof item.hint === "object") {
        hint = item.hint;
      }

      // Extract group information from hint
      if (hint?.groupId && hint?.groupTitle) {
        groupId = hint.groupId;
        if (!groupsMap.has(groupId)) {
          groupsMap.set(groupId, {
            id: groupId,
            title: hint.groupTitle,
            order: hint.groupIndex || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error processing hint for item:", item.id, error);
    }

    return {
      id: item.id,
      text: item.pergunta,
      responseType: normalizeResponseType(item.tipo_resposta),
      options: item.opcoes,
      isRequired: item.obrigatorio,
      order: item.ordem,
      groupId, // Ensure it always has a groupId
      parentQuestionId: item.parent_item_id || null,
      parentValue: item.condition_value || null,
      hint: item.hint || null,
      subChecklistId: item.sub_checklist_id,
      hasSubChecklist: !!item.sub_checklist_id,
      allowsPhoto: item.permite_foto || false,
      allowsVideo: item.permite_video || false,
      allowsAudio: item.permite_audio || false,
      allowsFiles: item.permite_files || false,
      weight: item.weight || 1,
    };
  });

  return { parsedQuestions, groupsMap };
};

/**
 * Processes responses data into a structured format
 */
export const processResponses = (responsesData: any[] | null): Record<string, any> => {
  if (!responsesData) return {};
  
  return responsesData.reduce((acc: Record<string, any>, r) => {
    acc[r.question_id] = {
      value: r.answer,
      comment: r.notes,
      actionPlan: r.action_plan,
      mediaUrls: r.media_urls || [],
      subChecklistResponses: r.sub_checklist_responses || {},
    };
    return acc;
  }, {});
};
