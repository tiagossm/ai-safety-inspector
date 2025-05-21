
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  
  // Função para salvar respostas da inspeção
  const saveResponses = async (inspectionId: string, responses: any[]) => {
    if (!responses || !responses.length) return true;
    
    let hasError = false;
    setIsSaving(true);
    
    // Formatar os dados para inserção
    const responsesData = responses.map(r => ({
      inspection_id: inspectionId,
      question_id: r.questionId,
      answer: r.value,
      action_plan: r.actionPlan,
      comments: r.comments,
      media_urls: r.mediaUrls || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    try {
      // Usar nossa função helper para envolver a chamada Supabase
      await wrapSupabaseCall(
        supabase
          .from("inspection_responses")
          .upsert(responsesData, { onConflict: 'inspection_id,question_id' })
      );
      
      console.log(`Salvou ${responsesData.length} respostas`);
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
    
    // Atualizar o status da inspeção
    try {
      await wrapSupabaseCall(
        supabase
          .from("inspections")
          .update({
            status: inspection.status,
            updated_at: new Date().toISOString(),
            inspector_name: inspection.inspectorName,
            inspector_title: inspection.inspectorTitle,
            company_name: inspection.companyName,
            responsible_name: inspection.responsibleName,
            location: inspection.location
          })
          .eq("id", inspection.id)
      );
      
      console.log(`Atualizou status da inspeção para ${inspection.status}`);
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
