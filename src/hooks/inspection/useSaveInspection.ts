
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SaveInspectionResponse {
  questionId: string;
  value: any;
  mediaUrls?: string[];
  comments?: string;
  notes?: string;
  actionPlan?: string;
  subChecklistResponses?: Record<string, any>;
}

export const useSaveInspection = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveInspection = async (inspection: any, responses: SaveInspectionResponse[]) => {
    setIsSaving(true);
    
    try {
      console.log("[useSaveInspection] Saving inspection:", inspection.id);
      console.log("[useSaveInspection] Responses to save:", responses);

      // Atualizar status da inspeção
      const { error: inspectionError } = await supabase
        .from("inspections")
        .update({
          status: inspection.status || "Em Andamento",
          updated_at: new Date().toISOString()
        })
        .eq("id", inspection.id);

      if (inspectionError) {
        throw inspectionError;
      }

      // Salvar respostas
      for (const response of responses) {
        if (!response.questionId) continue;

        const responseData = {
          inspection_id: inspection.id,
          inspection_item_id: response.questionId, // Usar inspection_item_id
          answer: response.value || "",
          media_urls: response.mediaUrls || [],
          comments: response.comments || null,
          notes: response.notes || null,
          action_plan: response.actionPlan || null,
          sub_checklist_responses: response.subChecklistResponses || null,
          updated_at: new Date().toISOString()
        };

        // Verificar se a resposta já existe
        const { data: existingResponse } = await supabase
          .from("inspection_responses")
          .select("id")
          .eq("inspection_id", inspection.id)
          .eq("inspection_item_id", response.questionId) // Usar inspection_item_id
          .single();

        if (existingResponse) {
          // Atualizar resposta existente
          const { error } = await supabase
            .from("inspection_responses")
            .update(responseData)
            .eq("id", existingResponse.id);

          if (error) {
            console.error("[useSaveInspection] Error updating response:", error);
            throw error;
          }
        } else {
          // Criar nova resposta
          const { error } = await supabase
            .from("inspection_responses")
            .insert(responseData);

          if (error) {
            console.error("[useSaveInspection] Error inserting response:", error);
            throw error;
          }
        }
      }

      console.log("[useSaveInspection] Inspection saved successfully");
      return true;
    } catch (error: any) {
      console.error("[useSaveInspection] Error saving inspection:", error);
      toast.error(`Erro ao salvar inspeção: ${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveInspection,
    isSaving
  };
};
