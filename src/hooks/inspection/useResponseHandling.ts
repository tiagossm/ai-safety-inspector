
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

  // Correção completa para garantir que o tipo de retorno seja sempre Promise<any>
  const handleSaveInspection = useCallback(async (currentResponses: Record<string, any>, inspection: any): Promise<any> => {
    if (!inspectionId) return Promise.resolve({});
    
    setSavingResponses(true);
    
    try {
      console.log("[useResponseHandling] Salvando respostas:", currentResponses);
      
      const savingPromises: Array<Promise<any>> = [];
      
      // Para cada resposta, precisamos salvar em um formato compatível com a tabela inspection_responses
      for (const [questionId, responseData] of Object.entries(currentResponses)) {
        // Preparar dados para salvar
        const responseToSave = {
          inspection_id: inspectionId,
          question_id: questionId,
          answer: responseData.value?.toString() || 'N/A',
          notes: JSON.stringify(responseData),
          media_urls: responseData.mediaUrls || [],
          action_plan: responseData.actionPlan || '',
          sub_checklist_responses: responseData.subChecklistResponses || null,
          updated_at: new Date().toISOString()
        };
        
        console.log(`[useResponseHandling] Salvando resposta para questão ${questionId}:`, responseToSave);
        
        // Criando uma Promise explícita que sempre será do tipo Promise<any>
        const savePromise = new Promise<any>((resolve, reject) => {
          supabase
            .from('inspection_responses')
            .upsert(responseToSave, {
              onConflict: 'inspection_id,question_id'
            })
            .then(({ error }) => {
              if (error) {
                console.error(`[useResponseHandling] Erro ao salvar resposta para questão ${questionId}:`, error);
                reject(error);
              } else {
                resolve({});
              }
            })
            .catch((err) => {
              console.error(`[useResponseHandling] Erro ao salvar resposta para questão ${questionId}:`, err);
              reject(err);
            });
        });
        
        savingPromises.push(savePromise);
      }
      
      // Aguardar todas as operações de salvamento
      await Promise.all(savingPromises);
      
      // Atualizar status da inspeção para "Em Andamento" se estiver "Pendente"
      if (inspection?.status === 'Pendente') {
        const updatePromise = new Promise<any>((resolve, reject) => {
          supabase
            .from('inspections')
            .update({ status: 'Em Andamento' })
            .eq('id', inspectionId)
            .then(({ error: updateError }) => {
              if (updateError) {
                console.error("Erro ao atualizar status da inspeção:", updateError);
                // Não interrompemos o fluxo por causa disso, apenas logamos o erro
                resolve({});
              } else {
                resolve({});
              }
            })
            .catch((err) => {
              console.error("Erro ao atualizar status da inspeção:", err);
              // Não interrompemos o fluxo por causa disso
              resolve({});
            });
        });
        
        await updatePromise;
      }
      
      console.log("[useResponseHandling] Respostas salvas com sucesso");
      toast.success("Respostas salvas com sucesso");
      
      return Promise.resolve({});
      
    } catch (error: any) {
      console.error("[useResponseHandling] Erro ao salvar inspeção:", error);
      toast.error(`Erro ao salvar inspeção: ${error.message || "Erro desconhecido"}`);
      return Promise.reject(error);
    } finally {
      setSavingResponses(false);
    }
  }, [inspectionId]);

  const handleSaveSubChecklistResponses = useCallback(async (parentQuestionId: string, subResponses: Record<string, any>) => {
    if (!inspectionId || !parentQuestionId) return;
    
    console.log("[useResponseHandling] Salvando respostas de sub-checklist:", parentQuestionId, subResponses);
    
    setResponses((prev) => {
      // Garantir que estamos trabalhando com uma cópia do objeto de resposta atual
      const currentResponse = prev[parentQuestionId] ? {...prev[parentQuestionId]} : {};
      
      // Atualizar as subChecklistResponses para a questão pai
      return {
        ...prev,
        [parentQuestionId]: {
          ...currentResponse,
          subChecklistResponses: JSON.stringify(subResponses),
          updatedAt: new Date().toISOString()
        }
      };
    });
    
    // Salvar a inspeção para persistir as alterações das sub-checklists
    // Isso será chamado pela página de execução da inspeção após o fechamento do diálogo
  }, [inspectionId, setResponses]);

  return {
    handleResponseChange,
    handleMediaChange,
    handleMediaUpload,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    savingResponses
  };
}
