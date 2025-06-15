
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { INSPECTION_STATUSES } from "@/types/inspection";

// Função auxiliar para converter promessas do Supabase em Promises completas
const wrapSupabaseCall = <T>(supabasePromise: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    // Adiciona um método .then() para capturar o resultado de qualquer promessa/objeto do Supabase
    supabasePromise
      .then((result: any) => {
        if (result && result.error) {
          reject(result.error);
        } else {
          resolve(result && result.data as T);
        }
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};

export const useSaveInspection = () => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  
  // Função para salvar respostas da inspeção na nova tabela hierárquica
  const saveResponses = async (inspectionId: string, responses: any[]) => {
    if (!responses || !responses.length) return true;
    
    let hasError = false;
    setIsSaving(true);
    
    // Formatar corretamente: answer sem duplicação de mediaUrls nem analysis
    const responsesData = responses.map(r => ({
      inspection_id: inspectionId,
      checklist_item_id: r.questionId,
      // O answer armazena SOMENTE o "value" e "mediaAnalysisResults" se existirem
      answer: (() => {
        let obj: any = {};
        if (typeof r.value !== "undefined") obj.value = r.value;
        if (r.mediaAnalysisResults) obj.mediaAnalysisResults = r.mediaAnalysisResults;
        // Salva somente quando não está vazio, senão salva null
        if (Object.keys(obj).length === 0) return { value: null };
        return obj;
      })(),
      action_plan: r.actionPlan,
      comments: r.comments,
      notes: r.notes,
      media_urls: Array.isArray(r.mediaUrls) ? [...r.mediaUrls] : [],
      parent_response_id: r.parentResponseId || null,
      created_at: r.createdAt ? r.createdAt : new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    try {
      // Usar nossa função helper para envolver a chamada Supabase
      await wrapSupabaseCall(
        supabase
          .from("checklist_item_responses")
          .upsert(responsesData, { onConflict: 'inspection_id,checklist_item_id' })
      );
      
      console.log(`[saveResponses] Salvou ${responsesData.length} corretas:`, responsesData);
    } catch (error) {
      console.error("Erro ao salvar respostas:", error);
      hasError = true;
    }
    
    setIsSaving(false);
    return !hasError;
  };
  
  // Função para salvar toda a inspeção com respostas
  const saveInspection = async (inspection: any, responses: any[], navigateAfterSave = true) => {
    let hasError = false;
    setIsSaving(true);
    
    // Mapear status para os valores corretos do banco
    let dbStatus = inspection.status;
    if (inspection.status === 'Concluído' || inspection.status === 'Completed') {
      dbStatus = INSPECTION_STATUSES.COMPLETED;
    } else if (inspection.status === 'Em Andamento' || inspection.status === 'In Progress') {
      dbStatus = INSPECTION_STATUSES.IN_PROGRESS;
    } else if (inspection.status === 'Pendente' || inspection.status === 'Pending') {
      dbStatus = INSPECTION_STATUSES.PENDING;
    }
    
    // Atualizar o status da inspeção
    try {
      await wrapSupabaseCall(
        supabase
          .from("inspections")
          .update({
            status: dbStatus,
            updated_at: new Date().toISOString(),
            inspector_name: inspection.inspectorName,
            inspector_title: inspection.inspectorTitle,
            company_name: inspection.companyName,
            responsible_name: inspection.responsibleName,
            location: inspection.location
          })
          .eq("id", inspection.id)
      );
      
      console.log(`Atualizou status da inspeção para ${dbStatus}`);
    } catch (error) {
      console.error("Erro ao atualizar inspeção:", error);
      hasError = true;
    }
    
    if (!hasError) {
      const responsesSaved = await saveResponses(inspection.id, responses);
      if (!responsesSaved) hasError = true;
    }
    
    setIsSaving(false);
    
    if (!hasError) {
      toast.success("Inspeção salva com sucesso!");
      if (navigateAfterSave) {
        navigate("/inspections");
      }
      return true;
    } else {
      toast.error("Erro ao salvar inspeção. Verifique o console para mais detalhes.");
      return false;
    }
  };
  
  return {
    saveInspection,
    saveResponses,
    isSaving
  };
};
