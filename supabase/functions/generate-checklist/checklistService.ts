
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { GeneratedQuestion } from "./questionGenerator.ts";

export interface ChecklistData {
  title: string;
  description: string;
  category: string;
  user_id: string | null;
  company_id: string | null;
}

export async function createChecklist(
  supabaseClient: ReturnType<typeof createClient>,
  checklistData: ChecklistData
): Promise<string> {
  const { data: checklist, error: checklistError } = await supabaseClient
    .from('checklists')
    .insert({
      title: checklistData.title,
      description: checklistData.description,
      is_template: true,
      status_checklist: 'ativo',
      category: checklistData.category || 'general',
      user_id: checklistData.user_id || null,
      company_id: checklistData.company_id || null
    })
    .select()
    .single();
    
  if (checklistError) {
    console.error("Error creating checklist:", checklistError);
    throw new Error(`Falha ao criar checklist: ${checklistError.message}`);
  }
  
  return checklist.id;
}

export async function addQuestionsToChecklist(
  supabaseClient: ReturnType<typeof createClient>,
  checklistId: string,
  questions: GeneratedQuestion[]
): Promise<{successCount: number, totalCount: number}> {
  let successCount = 0;
  
  for (const question of questions) {
    try {
      const { error } = await supabaseClient
        .from('checklist_itens')
        .insert({
          checklist_id: checklistId,
          pergunta: question.pergunta,
          tipo_resposta: question.tipo_resposta,
          obrigatorio: question.obrigatorio,
          ordem: question.ordem,
          opcoes: question.opcoes
        });
        
      if (error) throw error;
      successCount++;
    } catch (error) {
      console.error("Error adding question:", error);
    }
  }

  return {
    successCount,
    totalCount: questions.length
  };
}
