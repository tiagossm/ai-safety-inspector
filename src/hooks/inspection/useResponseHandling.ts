
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createBucketIfNeeded } from "@/utils/createBucketIfNeeded";

export interface ResponseData {
  value?: any;
  comment?: string;
  actionPlan?: string;
  mediaUrls?: string[];
  subChecklistResponses?: Record<string, any>;
  updatedAt?: string;
}

export function useResponseHandling(inspectionId: string | undefined, setResponses: (responses: Record<string, any>) => void) {
  const [savingResponses, setSavingResponses] = useState(false);

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

  const handleMediaChange = useCallback((questionId: string, mediaUrls: string[]) => {
    console.log(`[useResponseHandling] handleMediaChange para questão ${questionId}:`, mediaUrls);
    
    setResponses((prev) => {
      const currentResponse = prev[questionId] ? {...prev[questionId]} : {};
      
      // Garantir que estamos criando um novo array para mediaUrls
      return {
        ...prev,
        [questionId]: {
          ...currentResponse,
          mediaUrls: [...mediaUrls],
          updatedAt: new Date().toISOString()
        }
      };
    });
  }, [setResponses]);

  const handleMediaUpload = useCallback(async (questionId: string, file: File): Promise<string | null> => {
    if (!file || !inspectionId) return null;

    try {
      const bucketName = "inspection-media";
      const bucketReady = await createBucketIfNeeded(bucketName);

      if (!bucketReady) {
        toast.error("Não foi possível acessar o armazenamento de mídia");
        return null;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${inspectionId}/${questionId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (error) {
        console.error("Error uploading media:", error);
        toast.error(`Erro ao enviar mídia: ${error.message}`);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;

      setResponses(currentResponses => {
        const currentResponse = currentResponses[questionId] ? {...currentResponses[questionId]} : {};
        const currentMediaUrls = currentResponse.mediaUrls || [];
        
        return {
          ...currentResponses,
          [questionId]: {
            ...currentResponse,
            mediaUrls: [...currentMediaUrls, fileUrl],
            updatedAt: new Date().toISOString()
          }
        };
      });

      return fileUrl;
    } catch (error: any) {
      console.error("Error in media upload:", error);
      toast.error(`Erro ao enviar mídia: ${error.message}`);
      return null;
    }
  }, [inspectionId, setResponses]);

  // Implementando o salvamento real da inspeção
  const handleSaveInspection = useCallback(async (currentResponses: Record<string, any>, inspection: any) => {
    if (!inspectionId) return;
    
    setSavingResponses(true);
    
    try {
      console.log("[useResponseHandling] Salvando respostas:", currentResponses);
      
      // Preparar dados para salvar
      const responsesToSave = {};
      Object.entries(currentResponses).forEach(([questionId, responseData]) => {
        responsesToSave[questionId] = {
          ...responseData,
          // Garantir que temos os campos necessários
          value: responseData.value,
          comment: responseData.comment || "",
          actionPlan: responseData.actionPlan || "",
          mediaUrls: responseData.mediaUrls || [],
          updatedAt: new Date().toISOString()
        };
      });
      
      // Salvando no banco de dados - corrigindo a estrutura para adequar ao tipo esperado
      const { error } = await supabase
        .from('inspection_responses')
        .upsert({
          inspection_id: inspectionId,
          answer: 'N/A', // Campo obrigatório na tabela
          question_id: 'all', // Campo obrigatório na tabela
          notes: JSON.stringify(responsesToSave), // Armazenamos as respostas como um JSON no campo notes
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'inspection_id,question_id'
        });
      
      if (error) {
        throw new Error(`Erro ao salvar respostas: ${error.message}`);
      }
      
      // Atualizar status da inspeção para "Em Andamento" se estiver "Pendente"
      if (inspection?.status === 'Pendente') {
        const { error: updateError } = await supabase
          .from('inspections')
          .update({ status: 'Em Andamento' })
          .eq('id', inspectionId);
        
        if (updateError) {
          console.error("Erro ao atualizar status da inspeção:", updateError);
          // Não interromper o fluxo por causa disso
        }
      }
      
      console.log("[useResponseHandling] Respostas salvas com sucesso");
      
    } catch (error: any) {
      console.error("[useResponseHandling] Erro ao salvar inspeção:", error);
      throw error;
    } finally {
      setSavingResponses(false);
    }
  }, [inspectionId]);

  const handleSaveSubChecklistResponses = useCallback(async (subChecklistId: string, subResponses: Record<string, any>) => {
    if (!inspectionId || !subChecklistId) return;
    
    console.log("[useResponseHandling] Salvando respostas de sub-checklist:", subChecklistId, subResponses);
    
    // Implementar a lógica de salvamento de sub-checklist aqui se necessário
  }, [inspectionId]);

  return {
    handleResponseChange,
    handleMediaChange,
    handleMediaUpload,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    savingResponses
  };
}
