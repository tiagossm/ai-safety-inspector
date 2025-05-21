import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSaveInspection(inspectionId: string | undefined) {
  const [savingResponses, setSavingResponses] = useState(false);

  // Função para salvar as respostas da inspeção
  const handleSaveInspection = useCallback(async (currentResponses: Record<string, any>, inspection: any): Promise<any> => {
    if (!inspectionId) return Promise.resolve({});
    
    setSavingResponses(true);
    
    try {
      console.log("[useSaveInspection] Salvando respostas:", currentResponses);
      
      const savingPromises: Array<Promise<any>> = [];
      
      // Para cada resposta, precisamos salvar em um formato compatível com a tabela inspection_responses
      for (const [questionId, responseData] of Object.entries(currentResponses)) {
        // Preparar dados para salvar
        const responseToSave = {
          inspection_id: inspectionId,
          question_id: questionId,
          answer: responseData.value?.toString() || 'N/A',
          notes: JSON.stringify(responseData),
          media_urls: responseData.mediaUrls || [],
          action_plan: responseData.actionPlan || '',
          sub_checklist_responses: responseData.subChecklistResponses || null,
          updated_at: new Date().toISOString()
        };
        
        console.log(`[useSaveInspection] Salvando resposta para questão ${questionId}:`, responseToSave);
        
        // Garante que a promise é um Promise real (não apenas PromiseLike)
        const savePromise = Promise.resolve(
          supabase
            .from('inspection_responses')
            .upsert(responseToSave, {
              onConflict: 'inspection_id,question_id'
            })
        ).then(({ data, error }) => {
          if (error) {
            console.error(`[useSaveInspection] Erro ao salvar resposta para questão ${questionId}:`, error);
            throw error;
          }
          return data;
        }).catch(err => {
          console.error(`[useSaveInspection] Erro ao salvar resposta para questão ${questionId}:`, err);
          throw err;
        });
        
        savingPromises.push(savePromise);
      }
      
      // Aguardar todas as operações de salvamento
      await Promise.all(savingPromises);
      
      // Atualizar status da inspeção para "Em Andamento" se estiver "Pendente"
      if (inspection?.status === 'Pendente') {
        // Garante que a promise é um Promise real (não apenas PromiseLike)
        return Promise.resolve(
          supabase
            .from('inspections')
            .update({ status: 'Em Andamento' })
            .eq('id', inspectionId)
        ).then(({ data, error }) => {
          if (error) {
            console.error("Erro ao atualizar status da inspeção:", error);
            // Não interrompemos o fluxo por causa disso, apenas logamos o erro
            return {};
          } else {
            console.log("[useSaveInspection] Respostas salvas com sucesso");
            toast.success("Respostas salvas com sucesso");
            return data;
          }
        }).catch(err => {
          console.error("Erro ao atualizar status da inspeção:", err);
          // Não interrompemos o fluxo por causa disso
          return {};
        });
      }
      
      console.log("[useSaveInspection] Respostas salvas com sucesso");
      toast.success("Respostas salvas com sucesso");
      
      return Promise.resolve({});
      
    } catch (error: any) {
      console.error("[useSaveInspection] Erro ao salvar inspeção:", error);
      toast.error(`Erro ao salvar inspeção: ${error.message || "Erro desconhecido"}`);
      return Promise.reject(error);
    } finally {
      setSavingResponses(false);
    }
  }, [inspectionId]);

  return {
    handleSaveInspection,
    savingResponses
  };
}
