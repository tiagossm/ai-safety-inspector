
import { useState, useCallback } from "react";
import { ResponseData } from "./types/inspectionTypes";
import { useMediaHandler } from "./useMediaHandler";
import { useSubChecklistHandler } from "./useSubChecklistHandler";
import { useSaveInspection } from "./useSaveInspection";

export type { ResponseData } from "./types/inspectionTypes";

export function useResponseHandling(inspectionId: string | undefined, setResponses: (responses: Record<string, any>) => void) {
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
      
      // Console log para debugging
      console.log(`[useResponseHandling] Atualizando resposta para questão ${questionId}:`, 
        { anterior: currentResponse, nova: updatedResponse });
      
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
  const { handleSaveInspection, savingResponses } = useSaveInspection(inspectionId);

  return {
    handleResponseChange,
    handleMediaChange,
    handleMediaUpload,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    savingResponses
  };
}
