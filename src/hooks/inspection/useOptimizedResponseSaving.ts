import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResponseData {
  questionId: string;
  value?: any;
  actionPlan?: string;
  comments?: string;
  notes?: string;
  mediaUrls?: string[];
  updatedAt?: string;
}

export function useOptimizedResponseSaving() {
  const [isSaving, setIsSaving] = useState(false);

  const saveResponse = useCallback(async (inspectionId: string, response: ResponseData) => {
    try {
      setIsSaving(true);
      
      // Buscar questão diretamente do banco
      const { data: questionData } = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('id', response.questionId)
        .single();

      if (!questionData) {
        throw new Error('Questão não encontrada');
      }

      // Preparar dados da resposta com informações da questão
      const responseData = {
        inspection_id: inspectionId,
        question_id: response.questionId,
        answer: response.value,
        action_plan: response.actionPlan,
        comments: response.comments,
        notes: response.notes,
        media_urls: response.mediaUrls || [],
        // Dados da questão
        question_text: questionData.pergunta,
        question_type: questionData.tipo_resposta,
        question_options: questionData.opcoes,
        question_required: questionData.obrigatorio,
        question_order: questionData.ordem,
        question_weight: questionData.weight,
        allows_photo: questionData.permite_foto,
        allows_video: questionData.permite_video,
        allows_audio: questionData.permite_audio,
        allows_files: questionData.permite_files,
        hint: questionData.hint,
        parent_question_id: questionData.parent_item_id,
        condition_value: questionData.condition_value,
        has_subchecklist: questionData.has_subchecklist,
        subchecklist_id: questionData.sub_checklist_id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('inspection_responses')
        .upsert(responseData, { 
          onConflict: 'inspection_id,question_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      console.log(`Resposta salva para questão ${response.questionId}`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      toast.error('Erro ao salvar resposta');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const saveMultipleResponses = useCallback(async (inspectionId: string, responses: ResponseData[]) => {
    if (!responses.length) return true;

    try {
      setIsSaving(true);
      
      // Buscar todas as questões necessárias
      const questionIds = responses.map(r => r.questionId);
      const { data: questionsData } = await supabase
        .from('checklist_itens')
        .select('*')
        .in('id', questionIds);
      
      // Preparar todos os dados das respostas
      const responsesData = responses.map(response => {
        const questionData = questionsData?.find((item: any) => item.id === response.questionId);
        
        if (!questionData) {
          console.warn(`Questão ${response.questionId} não encontrada`);
          return null;
        }

        return {
          inspection_id: inspectionId,
          question_id: response.questionId,
          answer: response.value,
          action_plan: response.actionPlan,
          comments: response.comments,
          notes: response.notes,
          media_urls: response.mediaUrls || [],
          // Dados da questão
          question_text: questionData.pergunta,
          question_type: questionData.tipo_resposta,
          question_options: questionData.opcoes,
          question_required: questionData.obrigatorio,
          question_order: questionData.ordem,
          question_weight: questionData.weight,
          allows_photo: questionData.permite_foto,
          allows_video: questionData.permite_video,
          allows_audio: questionData.permite_audio,
          allows_files: questionData.permite_files,
          hint: questionData.hint,
          parent_question_id: questionData.parent_item_id,
          condition_value: questionData.condition_value,
          has_subchecklist: questionData.has_subchecklist,
          subchecklist_id: questionData.sub_checklist_id,
          updated_at: new Date().toISOString()
        };
      }).filter(Boolean);

      if (responsesData.length === 0) {
        throw new Error('Nenhuma resposta válida para salvar');
      }

      const { error } = await supabase
        .from('inspection_responses')
        .upsert(responsesData, { 
          onConflict: 'inspection_id,question_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      console.log(`${responsesData.length} respostas salvas`);
      toast.success(`${responsesData.length} respostas salvas com sucesso`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      toast.error('Erro ao salvar respostas');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    saveResponse,
    saveMultipleResponses,
    isSaving
  };
}