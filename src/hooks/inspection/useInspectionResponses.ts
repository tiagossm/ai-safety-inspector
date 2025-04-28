
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ResponseData {
  value?: any;
  comment?: string;
  actionPlan?: string;
  mediaUrls?: string[];
}

export function useInspectionResponses(inspectionId?: string) {
  const [responses, setResponses] = useState<Record<string, ResponseData>>({});
  const [savingResponses, setSavingResponses] = useState(false);

  const handleResponseChange = useCallback((questionId: string, data: Partial<ResponseData>) => {
    setResponses(prev => {
      const currentResponse = prev[questionId] || {};
      return {
        ...prev,
        [questionId]: {
          ...currentResponse,
          ...data
        }
      };
    });
  }, []);

  const saveResponses = useCallback(async (currentResponses: Record<string, ResponseData>) => {
    if (!inspectionId) {
      toast.error("ID da inspeção não fornecido");
      return false;
    }

    try {
      setSavingResponses(true);
      
      // Format responses for saving
      const responsesToSave = Object.entries(currentResponses).map(([questionId, response]) => ({
        inspection_id: inspectionId,
        question_id: questionId,
        answer: response.value || null,
        notes: response.comment || null,
        action_plan: response.actionPlan || null,
        media_urls: response.mediaUrls || [],
        updated_at: new Date().toISOString()
      }));
      
      // Save each response
      for (const response of responsesToSave) {
        // Check if the response already exists
        const { data: existing } = await supabase
          .from("inspection_responses")
          .select("id")
          .eq("inspection_id", inspectionId)
          .eq("question_id", response.question_id)
          .single();
          
        if (existing) {
          // Update existing response
          await supabase
            .from("inspection_responses")
            .update({
              answer: response.answer,
              notes: response.notes,
              action_plan: response.action_plan,
              media_urls: response.media_urls,
              updated_at: response.updated_at
            })
            .eq("inspection_id", inspectionId)
            .eq("question_id", response.question_id);
        } else {
          // Insert new response
          await supabase
            .from("inspection_responses")
            .insert(response);
        }
      }
      
      toast.success("Respostas salvas com sucesso");
      return true;
    } catch (error: any) {
      console.error("Error saving responses:", error);
      toast.error(`Erro ao salvar respostas: ${error.message || "Erro desconhecido"}`);
      return false;
    } finally {
      setSavingResponses(false);
    }
  }, [inspectionId]);

  return {
    responses,
    setResponses,
    handleResponseChange,
    saveResponses,
    savingResponses
  };
}
