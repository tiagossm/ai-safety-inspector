
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup, ChecklistOrigin } from "@/types/newChecklist";

export function useChecklistById(checklistId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [checklist, setChecklist] = useState<ChecklistWithStats | null>(null);
  
  useEffect(() => {
    if (!checklistId) {
      setLoading(false);
      return;
    }
    
    async function fetchChecklist() {
      try {
        setLoading(true);
        
        // Fetch the checklist
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select(`
            id, title, description, is_template, status, category, 
            status_checklist, responsible_id, company_id, user_id, 
            created_at, updated_at, due_date, is_sub_checklist,
            origin, parent_question_id,
            companies:company_id(id, fantasy_name),
            users:responsible_id(id, name)
          `)
          .eq("id", checklistId)
          .single();
        
        if (checklistError) {
          setError(new Error(checklistError.message));
          setLoading(false);
          return;
        }
        
        // Fetch questions for this checklist
        const { data: questionsData, error: questionsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("ordem", { ascending: true });
        
        if (questionsError) {
          setError(new Error(questionsError.message));
          setLoading(false);
          return;
        }
        
        // Transform the questions data
        const transformedQuestions: ChecklistQuestion[] = questionsData.map((q: any) => ({
          id: q.id,
          text: q.pergunta,
          responseType: mapResponseType(q.tipo_resposta),
          isRequired: q.obrigatorio,
          options: Array.isArray(q.opcoes) ? q.opcoes : [],
          order: q.ordem,
          allowsPhoto: q.permite_foto,
          allowsVideo: q.permite_video,
          allowsAudio: q.permite_audio,
          allowsFiles: false, // Default value
          weight: q.weight || 1,
          groupId: "default", // Default group
          parentId: q.parent_item_id,
          conditionValue: q.condition_value,
          parentQuestionId: q.parent_item_id,
          hint: q.hint,
          hasSubChecklist: q.has_subchecklist || false,
          subChecklistId: q.sub_checklist_id
        }));
        
        // Create the checklist with stats
        const transformedChecklist: ChecklistWithStats = {
          id: checklistData.id,
          title: checklistData.title,
          description: checklistData.description,
          is_template: checklistData.is_template,
          status: checklistData.status as "active" | "inactive",
          category: checklistData.category,
          responsible_id: checklistData.responsible_id,
          company_id: checklistData.company_id,
          user_id: checklistData.user_id,
          created_at: checklistData.created_at,
          updated_at: checklistData.updated_at,
          due_date: checklistData.due_date,
          is_sub_checklist: checklistData.is_sub_checklist,
          origin: (checklistData.origin || "manual") as ChecklistOrigin,
          parent_question_id: checklistData.parent_question_id,
          totalQuestions: transformedQuestions.length,
          completedQuestions: 0,
          companyName: checklistData.companies?.fantasy_name,
          responsibleName: checklistData.users?.name,
          questions: transformedQuestions,
          groups: [{
            id: "default",
            title: "Geral",
            order: 0
          }],
          // For backward compatibility
          isTemplate: checklistData.is_template,
          isSubChecklist: checklistData.is_sub_checklist,
          companyId: checklistData.company_id,
          responsibleId: checklistData.responsible_id,
          userId: checklistData.user_id,
          createdAt: checklistData.created_at,
          updatedAt: checklistData.updated_at,
          dueDate: checklistData.due_date
        };
        
        setChecklist(transformedChecklist);
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    }
    
    fetchChecklist();
  }, [checklistId]);
  
  // Helper function to map response types
  function mapResponseType(type: string): "yes_no" | "numeric" | "text" | "multiple_choice" | "photo" | "signature" {
    const typeMap: Record<string, any> = {
      "sim/não": "yes_no",
      "numérico": "numeric",
      "texto": "text",
      "seleção múltipla": "multiple_choice",
      "foto": "photo",
      "assinatura": "signature"
    };
    
    return typeMap[type] || "yes_no";
  }
  
  return { checklist, loading, error, setChecklist };
}

export default useChecklistById;
