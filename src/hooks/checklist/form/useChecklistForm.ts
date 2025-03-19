
import { useState } from "react";
import { NewChecklist } from "@/types/checklist";
// import { supabase } from "@/integrations/supabase/client"; // para gravar no BD

interface AiQuestion {
  text: string;
  type: string;
  required: boolean;
  // etc...
}

// Helper function to convert UI-friendly type to database type
export const normalizeResponseType = (type: string): string => {
  // Map of user-friendly types to database-compatible types
  const typeMap: Record<string, string> = {
    'sim/não': 'yes_no',
    'múltipla escolha': 'multiple_choice',
    'numérico': 'numeric',
    'texto': 'text',
    'foto': 'photo',
    'assinatura': 'signature'
  };

  return typeMap[type] || type; // Return original if no mapping found
};

export function useChecklistForm() {
  const [form, setForm] = useState<NewChecklist>({
    title: "",
    description: "",
    is_template: false,
    category: "general",
    responsible_id: "",
    company_id: undefined,
    due_date: null
  });

  // Aqui podemos armazenar as perguntas geradas pela IA
  const [questions, setQuestions] = useState<AiQuestion[]>([]);

  // Depois, podemos ter uma função para "finalizar" (salvar) no Supabase:
  // Exemplo (comentado): 
  // async function saveChecklist() {
  //   const { data: checklistData, error: checklistError } = await supabase
  //     .from("checklists")
  //     .insert({ ...form })
  //     .select("*")
  //     .single();
  //   if (checklistError) throw checklistError;
  //
  //   if (questions.length > 0) {
  //     const preparedItems = questions.map((q, idx) => ({
  //       checklist_id: checklistData.id,
  //       pergunta: q.text,
  //       tipo_resposta: normalizeResponseType(q.type), // se precisar converter
  //       obrigatorio: q.required,
  //       ordem: idx + 1
  //     }));
  //     await supabase.from("checklist_itens").insert(preparedItems);
  //   }
  //   // etc.
  // }

  return {
    form,
    setForm,
    questions,
    setQuestions,
    normalizeResponseType,
    // saveChecklist
  };
}
