
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface CreateInspectionParams {
  checklistId: string;
  companyId?: string;
  responsibleId?: string;
  scheduledDate?: string;
  location?: string;
}

export function useCreateInspection() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInspection = async (params: CreateInspectionParams) => {
    const { checklistId, companyId, responsibleId, scheduledDate, location } = params;
    
    try {
      setCreating(true);
      setError(null);
      
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Get the checklist to copy its questions
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists')
        .select('*, company_id')
        .eq('id', checklistId)
        .single();
      
      if (checklistError) {
        throw new Error(`Erro ao buscar checklist: ${checklistError.message}`);
      }
      
      // Use company from checklist if it has one
      const finalCompanyId = companyId || checklist.company_id;
      
      // Create the inspection
      const inspectionId = uuidv4();
      const { error: insertError } = await supabase
        .from('inspections')
        .insert({
          id: inspectionId,
          checklist_id: checklistId,
          company_id: finalCompanyId,
          responsible_id: responsibleId,
          scheduled_date: scheduledDate,
          location: location,
          status: 'em_andamento',
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        throw new Error(`Erro ao criar inspeção: ${insertError.message}`);
      }
      
      // Get the questions to copy into inspection_questions
      const { data: questions, error: questionsError } = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('checklist_id', checklistId);
      
      if (questionsError) {
        throw new Error(`Erro ao buscar questões: ${questionsError.message}`);
      }
      
      // Create inspection questions
      if (questions && questions.length > 0) {
        const inspectionQuestions = questions.map(q => ({
          id: uuidv4(),
          inspection_id: inspectionId,
          question_id: q.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        // Check if the table exists in the schema
        const { error: questionsInsertError } = await supabase
          .from('inspection_questions')
          .insert(inspectionQuestions);
        
        if (questionsInsertError) {
          console.error("Erro ao criar questões da inspeção:", questionsInsertError);
          // Continue even if there's an error with questions, as the inspection was created
        }
      }
      
      return { id: inspectionId, checklist_id: checklistId };
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar a inspeção');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return { createInspection, creating, error };
}
