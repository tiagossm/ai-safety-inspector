
import { supabase } from "@/integrations/supabase/client";
import { normalizeResponseType } from "@/utils/inspection/normalizationUtils";

/**
 * Fetches and processes subchecklist data for a specific question
 */
export const fetchSubChecklist = async (questionId: string, subChecklistId: string) => {
  try {
    const { data: checklistData, error: checklistError } = await supabase
      .from("checklists")
      .select("*")
      .eq("id", subChecklistId)
      .single();

    if (checklistError) {
      console.error(`Error fetching subchecklist ${subChecklistId}:`, checklistError);
      return null;
    }

    const { data: subQuestions, error: questionsError } = await supabase
      .from("checklist_itens")
      .select("*")
      .eq("checklist_id", subChecklistId)
      .order("ordem", { ascending: true });

    if (questionsError || !subQuestions?.length) {
      console.error(`Error fetching subchecklist questions for ${subChecklistId}:`, questionsError);
      return null;
    }

    const processedSubQuestions = subQuestions.map((item: any) => ({
      id: item.id,
      text: item.pergunta,
      responseType: normalizeResponseType(item.tipo_resposta),
      options: item.opcoes,
      isRequired: item.obrigatorio,
      order: item.ordem,
      parentQuestionId: item.parent_item_id || null,
      parentValue: item.condition_value || null,
      hint: item.hint || null,
      allowsPhoto: item.permite_foto || false,
      allowsVideo: item.permite_video || false,
      allowsAudio: item.permite_audio || false,
      allowsFiles: item.permite_files || false,
      weight: item.weight || 1,
    }));

    return {
      id: checklistData.id,
      title: checklistData.title,
      description: checklistData.description,
      questions: processedSubQuestions,
    };
  } catch (err) {
    console.error(`Error processing subchecklist for question ${questionId}:`, err);
    return null;
  }
};

/**
 * Fetches all subchecklists for a given set of questions
 */
export const fetchAllSubChecklists = async (questions: any[]): Promise<Record<string, any>> => {
  if (!questions?.length) return {};
  
  const questionsWithSubchecklist = questions.filter(q => q.subChecklistId);
  const subChecklistsMap: Record<string, any> = {};

  if (questionsWithSubchecklist.length > 0) {
    console.log(`Fetching ${questionsWithSubchecklist.length} subchecklists`);
    
    for (const question of questionsWithSubchecklist) {
      const subChecklist = await fetchSubChecklist(question.id, question.subChecklistId);
      if (subChecklist) {
        subChecklistsMap[question.id] = subChecklist;
      }
    }
  }

  return subChecklistsMap;
};
