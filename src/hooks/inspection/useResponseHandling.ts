
import { useState, useCallback } from "react";
import { ResponseData } from "./types/inspectionTypes";
import { useMediaHandler } from "./useMediaHandler";
import { useSubChecklistHandler } from "./useSubChecklistHandler";
import { useSaveInspection } from "./useSaveInspection";

export type { ResponseData } from "./types/inspectionTypes";

export function useResponseHandling(inspectionId: string | undefined, setResponses: (responses: Record<string, any>) => void) {
  const [savingData, setSavingData] = useState(false);

  // Função otimizada para garantir estrutura consistente das respostas
  const handleResponseChange = useCallback((questionId: string, data: any) => {
    setResponses((prev) => {
      const currentResponse = prev[questionId] || {};
      
      // Garantir estrutura consistente para evitar loops
      const safeData = {
        value: data?.value !== undefined ? data.value : currentResponse.value,
        mediaUrls: Array.isArray(data?.mediaUrls) ? [...data.mediaUrls] : 
                   Array.isArray(currentResponse.mediaUrls) ? [...currentResponse.mediaUrls] : [],
        mediaAnalysisResults: data?.mediaAnalysisResults || currentResponse.mediaAnalysisResults || {},
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // Verificar se houve mudança real para evitar re-renders desnecessários
      const hasChanged = JSON.stringify(currentResponse) !== JSON.stringify(safeData);
      
      if (!hasChanged) {
        console.log(`[useResponseHandling] Sem mudanças para questão ${questionId}, ignorando atualização`);
        return prev;
      }
      
      console.log(`[useResponseHandling] Atualizando resposta para questão ${questionId}:`, 
        { anterior: currentResponse, nova: safeData });
      
      return {
        ...prev,
        [questionId]: safeData
      };
    });
  }, [setResponses]);

  // Integrar handlers específicos
  const { handleMediaChange, handleMediaUpload } = useMediaHandler(inspectionId, handleResponseChange);
  const { handleSaveSubChecklistResponses } = useSubChecklistHandler(setResponses);
  const { saveInspection, isSaving } = useSaveInspection();

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
    savingResponses: savingData || isSaving
  };
}
