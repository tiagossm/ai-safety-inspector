
import { UiGroup, UiQuestion } from "@/types/editorTypes";

/**
 * Processes checklist items and extracts groups from them
 */
export function processGroupsFromItems(items: any[]): { 
  groups: UiGroup[],
  questions: UiQuestion[]
} {
  const groups: UiGroup[] = [];
  const questions: UiQuestion[] = [];
  
  // Extract group information from hints
  items.forEach(item => {
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
          // Convert each item to string
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

  return { groups, questions };
}
