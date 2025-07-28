
import { useState, useCallback } from "react";
import { ResponseData } from "./types/inspectionTypes";
import { useMediaHandler } from "./useMediaHandler";
import { useSubChecklistHandler } from "./useSubChecklistHandler";
import { useSaveInspection } from "./useSaveInspection";
import { useOptimizedResponseSaving } from "./useOptimizedResponseSaving";

export type { ResponseData } from "./types/inspectionTypes";

export function useResponseHandling(inspectionId: string | undefined, setResponses: (responses: Record<string, any>) => void) {
  const [savingData, setSavingData] = useState(false);

  // Função melhorada para garantir que as respostas tenham atualizações corretas
  const handleResponseChange = useCallback((questionId: string, data: any) => {
    setResponses((prev) => {
      // Certifique-se de que estamos trabalhando com uma cópia do objeto de resposta atual
      const currentResponse = prev[questionId] ? {...prev[questionId]} : {};
      
      // Se data é um objeto, spread suas propriedades para a resposta atual
      // Se não, assume que é um valor simples para o campo value
      let updatedResponse;
      if (typeof data === 'object' && data !== null) {
        // Evitar referência circular ao fazer shallow copy dos dados
        const cleanData = { ...data };
        if (cleanData.value && typeof cleanData.value === 'object') {
          cleanData.value = { ...cleanData.value };
        }
        updatedResponse = { ...currentResponse, ...cleanData, updatedAt: new Date().toISOString() };
      } else {
        updatedResponse = { ...currentResponse, value: data, updatedAt: new Date().toISOString() };
      }
      
      // Garantir que mediaUrls seja sempre um array único (evitar duplicatas)
      if (updatedResponse.mediaUrls) {
        updatedResponse.mediaUrls = [...new Set(updatedResponse.mediaUrls)];
      } else if (data && data.mediaUrls) {
        updatedResponse.mediaUrls = [...new Set(data.mediaUrls)];
      } else if (!updatedResponse.mediaUrls) {
        updatedResponse.mediaUrls = [];
      }
      
      // Console log para debugging sem referência circular
      console.log(`[useResponseHandling] Atualizando resposta para questão ${questionId}:`, 
        { 
          anterior: Object.keys(currentResponse), 
          nova: Object.keys(updatedResponse),
          mediaUrls: updatedResponse.mediaUrls.length
        });
      
      // Retornar um novo objeto de respostas com a resposta atualizada
      return {
        ...prev,
        [questionId]: updatedResponse
      };
    });
  }, [setResponses]);

  // Integrar handlers específicos
  const { handleMediaChange, handleMediaUpload } = useMediaHandler(inspectionId, handleResponseChange);
  const { handleSaveSubChecklistResponses } = useSubChecklistHandler(setResponses);
  const { saveInspection, isSaving } = useSaveInspection();
  const { saveResponse, saveMultipleResponses, isSaving: isSavingOptimized } = useOptimizedResponseSaving();

  // Função para salvar a inspeção
  const handleSaveInspection = useCallback(async (responses: Record<string, any>, inspection: any) => {
    setSavingData(true);
    try {
      // Transformar o objeto responses em um array de responses como esperado pelo saveInspection
      const responsesArray = Object.entries(responses).map(([questionId, response]) => ({
        questionId,
        ...response
      }));
      
      const result = await saveInspection(inspection, responsesArray);
      return result;
    } catch (error) {
      console.error("Erro ao salvar inspeção:", error);
      return false;
    } finally {
      setSavingData(false);
    }
  }, [saveInspection]);

  return {
    handleResponseChange,
    handleMediaChange,
    handleMediaUpload,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    savingResponses: savingData || isSaving || isSavingOptimized,
    saveResponse,
    saveMultipleResponses
  };
}
