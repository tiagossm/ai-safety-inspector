
import { useState, useCallback } from "react";
import { ResponseData } from "./types/inspectionTypes";
import { useMediaHandler } from "./useMediaHandler";
import { useSubChecklistHandler } from "./useSubChecklistHandler";
import { useSaveInspection } from "./useSaveInspection";
import { useInspectionAuditLogs } from "./useInspectionAuditLogs";

export type { ResponseData } from "./types/inspectionTypes";

export function useResponseHandling(inspectionId: string | undefined, setResponses: (responses: Record<string, any>) => void) {
  // const [savingData, setSavingData] = useState(false); // Will be replaced by isSaving from useSaveInspection
  const { logAuditAction } = useInspectionAuditLogs(inspectionId);

  // Função melhorada para garantir que as respostas tenham atualizações corretas
  const handleResponseChange = useCallback((questionId: string, data: any) => {
    setResponses((prev) => {
      // Certifique-se de que estamos trabalhando com uma cópia do objeto de resposta atual
      const currentResponse = prev[questionId] ? {...prev[questionId]} : {};
      
      // Se data é um objeto, spread suas propriedades para a resposta atual
      // Se não, assume que é um valor simples para o campo value
      const updatedResponse = typeof data === 'object' && data !== null
        ? { ...currentResponse, ...data, updatedAt: new Date().toISOString() }
        : { ...currentResponse, value: data, updatedAt: new Date().toISOString() };
      
      // Garantir que mediaUrls seja sempre um array
      if (updatedResponse.mediaUrls) {
        updatedResponse.mediaUrls = [...updatedResponse.mediaUrls];
      } else if (data && data.mediaUrls) {
        updatedResponse.mediaUrls = [...data.mediaUrls];
      } else if (!updatedResponse.mediaUrls) {
        updatedResponse.mediaUrls = [];
      }
      
      // Log manual de auditoria para mudanças específicas que podem não ser capturadas pelo trigger
      if (typeof data === 'object' && data !== null) {
        // Log para comentários
        if (data.comments !== undefined && data.comments !== currentResponse.comments) {
          logAuditAction(
            questionId,
            'edit_comment',
            'comments',
            currentResponse.comments || null,
            data.comments || null
          );
        }
        
        // Log para notas
        if (data.notes !== undefined && data.notes !== currentResponse.notes) {
          logAuditAction(
            questionId,
            'edit_notes',
            'notes',
            currentResponse.notes || null,
            data.notes || null
          );
        }
      }
      
      // Console log para debugging
      console.log(`[useResponseHandling] Atualizando resposta para questão ${questionId}:`, 
        { anterior: currentResponse, nova: updatedResponse });
      
      // Retornar um novo objeto de respostas com a resposta atualizada
      return {
        ...prev,
        [questionId]: updatedResponse
      };
    });
  }, [setResponses, logAuditAction]);

  // Integrar handlers específicos
  const { handleMediaChange, handleMediaUpload } = useMediaHandler(inspectionId, handleResponseChange);
  const { handleSaveSubChecklistResponses } = useSubChecklistHandler(setResponses);
  const { saveInspection: saveInspectionMutateAsync, isSaving } = useSaveInspection(); // Renamed to avoid confusion

  // Função para salvar a inspeção
  const handleSaveInspection = useCallback(async (responses: Record<string, any>, inspection: any) => {
    // setSavingData(true); // No longer needed, isSaving from useSaveInspection will be used
    try {
      // Transformar o objeto responses em um array de responses como esperado pelo saveInspection
      const responsesArray = Object.entries(responses).map(([questionId, response]) => ({
        questionId,
        ...response
      }));
      
      // Call the mutateAsync function with the variables object
      const result = await saveInspectionMutateAsync({ inspection, responsesArray });
      
      // Log de auditoria para salvamento da inspeção
      if (result && inspectionId) {
        await logAuditAction(
          null,
          'save_inspection',
          'inspection_data',
          null,
          { total_responses: responsesArray.length },
          { saved_at: new Date().toISOString() }
        );
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao salvar inspeção:", error);
      // The mutation hook (useSaveInspection) already handles toasts for errors.
      // Rethrow or return false if specific handling is needed here.
      return false;
    } 
    // finally {
      // setSavingData(false); // No longer needed
    // }
  }, [saveInspectionMutateAsync, logAuditAction, inspectionId]);

  return {
    handleResponseChange,
    handleMediaChange,
    handleMediaUpload,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    savingResponses: isSaving, // Directly use isSaving from the mutation hook
    logAuditAction
  };
}
