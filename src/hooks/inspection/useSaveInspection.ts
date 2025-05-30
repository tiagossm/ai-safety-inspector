
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface SaveInspectionVariables {
  inspection: any; // Consider defining a more specific type for inspection
  responsesArray: SaveInspectionResponse[];
}

export const useSaveInspection = () => {
  const queryClient = useQueryClient();

  const saveInspectionMutation = useMutation({
    mutationFn: async (variables: SaveInspectionVariables) => {
      const { inspection, responsesArray } = variables;
      const toastId = toast.loading("Salvando progresso...");

      try {
        console.log("[useSaveInspection] Mutation: Saving inspection:", inspection.id);
        console.log("[useSaveInspection] Mutation: Responses to save:", responsesArray);

        // 1. Atualizar status da inspeção (e updated_at)
        const { error: inspectionUpdateError } = await supabase
          .from("inspections")
          .update({
            status: inspection.status || "Em Andamento", // or 'in_progress' if that's the enum
            updated_at: new Date().toISOString(),
            // Potentially update progress field here if calculated
          })
          .eq("id", inspection.id);

        if (inspectionUpdateError) {
          console.error("[useSaveInspection] Mutation: Error updating inspection status:", inspectionUpdateError);
          throw inspectionUpdateError;
        }

        // 2. Salvar/Atualizar respostas
        // Consider batching these operations if possible and supported by Supabase client for better performance
        for (const response of responsesArray) {
          if (!response.questionId) {
            console.warn("[useSaveInspection] Mutation: Skipping response due to missing questionId", response);
            continue;
          }

          const responseData = {
            inspection_id: inspection.id,
            inspection_item_id: response.questionId,
            answer: response.value ?? "", // Ensure null/undefined becomes empty string or handle as needed
            media_urls: response.mediaUrls || [],
            comments: response.comments || null,
            notes: response.notes || null,
            action_plan: response.actionPlan || null,
            sub_checklist_responses: response.subChecklistResponses || null,
            updated_at: new Date().toISOString(),
            // completed_at might be set here if a response marks a question as "done"
          };

          // Upsert logic: Check if exists, then update or insert.
          // Supabase upsert could simplify this if primary key (composite inspection_id, inspection_item_id) is set up for it.
          // For now, retaining the check-then-act logic.
          const { data: existingResponse, error: selectError } = await supabase
            .from("inspection_responses")
            .select("id")
            .eq("inspection_id", inspection.id)
            .eq("inspection_item_id", response.questionId)
            .maybeSingle(); // Use maybeSingle to avoid error if no response exists

          if (selectError) {
            console.error("[useSaveInspection] Mutation: Error selecting existing response:", selectError);
            throw selectError; // Rethrow if selecting itself fails critically
          }

          if (existingResponse) {
            const { error: updateError } = await supabase
              .from("inspection_responses")
              .update(responseData)
              .eq("id", existingResponse.id);
            if (updateError) {
              console.error("[useSaveInspection] Mutation: Error updating response:", updateError);
              throw updateError;
            }
          } else {
            const { error: insertError } = await supabase
              .from("inspection_responses")
              .insert(responseData);
            if (insertError) {
              console.error("[useSaveInspection] Mutation: Error inserting new response:", insertError);
              throw insertError;
            }
          }
        }
        
        toast.dismiss(toastId);
        toast.success("Progresso salvo com sucesso!");
        console.log("[useSaveInspection] Mutation: Inspection saved successfully");
        return true; // Or any relevant data from the save operation
      } catch (error: any) {
        toast.dismiss(toastId);
        console.error("[useSaveInspection] Mutation: Error saving inspection:", error);
        toast.error("Erro ao salvar progresso", {
          description: error.message || "Ocorreu um erro inesperado.",
        });
        throw error; // Rethrow to allow react-query to handle it as an error state
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch data after successful save
      // Invalidate specific inspection details
      queryClient.invalidateQueries({ queryKey: ['inspection', variables.inspection.id] });
      // Invalidate the list of inspections if status/progress shown there might change
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      
      console.log("[useSaveInspection] Mutation: onSuccess, queries invalidated for inspection ID:", variables.inspection.id);
    },
    // onError: (error, variables, context) => { /* Handled by try/catch in mutationFn for toasts */ }
  });

  return {
    // Expose mutateAsync for promise-based usage if needed, or just mutate
    saveInspection: saveInspectionMutation.mutateAsync, 
    isSaving: saveInspectionMutation.isPending,
  };
};
