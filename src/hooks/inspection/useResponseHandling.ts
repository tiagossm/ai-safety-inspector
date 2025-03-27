
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useResponseHandling(inspectionId: string | undefined, setResponses: React.Dispatch<React.SetStateAction<Record<string, any>>>) {
  const handleResponseChange = useCallback((questionId: string, data: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        ...data,
      },
    }));
  }, [setResponses]);

  const handleSaveInspection = useCallback(async (responses: Record<string, any>, inspection: any) => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      const responsesToSave = Object.entries(responses).map(([questionId, data]) => ({
        inspection_id: inspectionId,
        question_id: questionId,
        answer: data.value,
        notes: data.comment || null,
        action_plan: data.actionPlan || null,
        media_urls: data.mediaUrls || [],
        sub_checklist_responses: data.subChecklistResponses || {},
        updated_at: new Date().toISOString(),
      }));

      if (responsesToSave.length === 0) {
        console.log("No responses to save");
        return;
      }

      console.log(`Saving ${responsesToSave.length} responses`);

      const { error } = await supabase
        .from("inspection_responses")
        .upsert(responsesToSave, {
          onConflict: "inspection_id,question_id",
          ignoreDuplicates: false,
        });

      if (error) throw error;

      if (inspection?.status === "pending") {
        const { error: updateError } = await supabase
          .from("inspections")
          .update({ status: "in_progress" })
          .eq("id", inspectionId);

        if (updateError) throw updateError;

        return {
          ...inspection,
          status: "in_progress"
        };
      }

      return inspection;
    } catch (error: any) {
      console.error("Error saving inspection responses:", error);
      throw new Error(`Erro ao salvar respostas: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId]);

  // Make sure this function returns a Promise<boolean> consistently
  const handleSaveSubChecklistResponses = useCallback(async (
    parentQuestionId: string, 
    responses: Record<string, any>
  ): Promise<boolean> => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      // Convert the responses object to an array format for Supabase
      const responsesArray = Array.isArray(responses) 
        ? responses 
        : Object.values(responses);

      const formattedResponses = responsesArray.map(response => ({
        inspection_id: inspectionId,
        question_id: response.questionId,
        answer: response.value,
        notes: response.comment || null,
        action_plan: response.actionPlan || null,
        media_urls: response.mediaUrls || [],
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("inspection_responses")
        .upsert(formattedResponses, {
          onConflict: "inspection_id,question_id",
          ignoreDuplicates: false,
        });

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error("Error saving sub-checklist responses:", error);
      throw new Error(`Erro ao salvar respostas do sub-checklist: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId]);

  return {
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses
  };
}
