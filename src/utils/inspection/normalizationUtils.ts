
import { toast } from "sonner";

/**
 * Normalizes response type to a consistent format
 */
export const normalizeResponseType = (tipo: string): "yes_no" | "text" | "multiple_choice" | "numeric" | "photo" | "signature" => {
  if (!tipo) return "text";
  
  const type = tipo.toLowerCase();
  
  if (type.includes('sim/não') || type.includes('sim/nao') || type.includes('yes_no') || type.includes('yes/no')) {
    return "yes_no";
  } else if (type.includes('texto') || type.includes('text')) {
    return "text";
  } else if (type.includes('número') || type.includes('number') || type.includes('numeric') || type.includes('numérico')) {
    return "numeric";
  } else if (type.includes('múltipla escolha') || type.includes('multiple_choice') || type.includes('múltipla')) {
    return "multiple_choice";
  } else if (type.includes('foto') || type.includes('photo')) {
    return "photo";
  } else if (type.includes('signature') || type.includes('assinatura')) {
    return "signature";
  }
  
  // Default to text if no match found
  return "text";
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

    // Always ensure each question has a valid groupId
    const finalGroupId = groupId || DEFAULT_GROUP.id;

    const processedQuestion = {
      id: item.id,
      text: item.pergunta,
      responseType: normalizeResponseType(item.tipo_resposta),
      options: item.opcoes,
      isRequired: item.obrigatorio,
      order: item.ordem,
      groupId: finalGroupId, // Ensuring every question has a groupId
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

    console.log(`Processed question ${item.id} with groupId ${finalGroupId}`);
    return processedQuestion;
  });

  console.log(`Processed ${parsedQuestions.length} questions with ${groupsMap.size} groups`);
  console.log("Available groups:", Array.from(groupsMap.values()).map(g => g.id));

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
