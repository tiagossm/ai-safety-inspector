import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { INSPECTION_STATUSES } from "@/types/inspection";

export interface ResponseData {
  value?: any;
  comment?: string;
  actionPlan?: string;
  mediaUrls?: string[];
  subChecklistResponses?: Record<string, any>;
  updatedAt?: string;
  [key: string]: any;
}

export interface InspectionResponse {
  inspection_id: string;
  question_id: string;
  answer: any;
  notes?: string | null;
  action_plan?: string | null;
  media_urls?: string[];
  sub_checklist_responses?: Record<string, any>;
  updated_at: string;
}

export function useResponseHandling(
  inspectionId: string | undefined, 
  setResponses: React.Dispatch<React.SetStateAction<Record<string, ResponseData>>>
) {
  const handleResponseChange = useCallback((questionId: string, data: ResponseData) => {
    if (!questionId) {
      console.error("Question ID is required for response change");
      return;
    }
    
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        ...data,
      },
    }));
  }, [setResponses]);

  const handleSaveInspection = useCallback(async (
    responses: Record<string, ResponseData>, 
    inspection: any
  ): Promise<any> => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      const responsesToSave: InspectionResponse[] = Object.entries(responses).map(([questionId, data]) => ({
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
        return inspection;
      }

      const { error } = await supabase
        .from("inspection_responses")
        .upsert(responsesToSave, {
          onConflict: "inspection_id,question_id",
          ignoreDuplicates: false,
        });

      if (error) throw error;

      if (inspection?.status === INSPECTION_STATUSES.PENDING) {
        const { error: updateError } = await supabase
          .from("inspections")
          .update({ status: INSPECTION_STATUSES.IN_PROGRESS })
          .eq("id", inspectionId);

        if (updateError) throw updateError;

        return {
          ...inspection,
          status: INSPECTION_STATUSES.IN_PROGRESS
        };
      }

      return inspection;
    } catch (error: any) {
      console.error("Error saving inspection responses:", error);
      throw new Error(`Erro ao salvar respostas: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId]);

  const handleSaveSubChecklistResponses = useCallback(async (
    parentQuestionId: string, 
    responses: Record<string, any>
  ): Promise<void> => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");
      if (!parentQuestionId) throw new Error("ID da pergunta pai não fornecido");

      const responsesArray = Array.isArray(responses) 
        ? responses 
        : Object.values(responses);

      if (!responsesArray.length) {
        return;
      }

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
      
      setResponses(prev => ({
        ...prev,
        [parentQuestionId]: {
          ...(prev[parentQuestionId] || {}),
          subChecklistResponses: responses,
        }
      }));

      return;
    } catch (error: any) {
      console.error("Error saving sub-checklist responses:", error);
      throw new Error(`Erro ao salvar respostas do sub-checklist: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId, setResponses]);

  return {
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses
  };
}
