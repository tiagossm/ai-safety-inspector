
import { useCallback } from "react";
import { toast } from "sonner";

export function useSubChecklistHandler(
  setResponses: (responses: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void
) {
  const handleSaveSubChecklistResponses = useCallback(async (parentQuestionId: string, subResponses: Record<string, any>): Promise<void> => {
    if (!parentQuestionId) {
      return Promise.reject(new Error("ID da questão pai não fornecido"));
    }
    
    console.log("[useSubChecklistHandler] Salvando respostas de sub-checklist:", parentQuestionId, subResponses);
    
    // Usando Promise explícita para garantir que temos um objeto Promise completo
    return new Promise<void>((resolve, reject) => {
      try {
        setResponses((prev) => {
          // Garantir que estamos trabalhando com uma cópia do objeto de resposta atual
          const currentResponse = prev[parentQuestionId] ? {...prev[parentQuestionId]} : {};
          
          // Atualizar as subChecklistResponses para a questão pai
          const updatedResponses = {
            ...prev,
            [parentQuestionId]: {
              ...currentResponse,
              subChecklistResponses: JSON.stringify(subResponses),
              updatedAt: new Date().toISOString()
            }
          };
          
          return updatedResponses;
        });
        
        resolve();
      } catch (error) {
        console.error("[useSubChecklistHandler] Erro ao salvar respostas do sub-checklist:", error);
        reject(error);
      }
    });
  }, [setResponses]);

  return {
    handleSaveSubChecklistResponses
  };
}
