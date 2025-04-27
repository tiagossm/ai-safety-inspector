
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

  // Handle changes to response values
  const handleResponseChange = useCallback((questionId: string, value: any, additionalData?: any) => {
    setResponses((prev) => {
      const currentResponse = prev[questionId] || {};
      
      let updatedResponse;
      
      if (typeof additionalData === 'object') {
        // Handle the case where we're updating comment, media, etc.
        updatedResponse = {
          ...currentResponse,
          value: value, // Keep the existing value
          ...additionalData // Add the additional data (comment, etc.)
        };
      } else {
        // Simple value update
        updatedResponse = {
          ...currentResponse,
          value: value
        };
      }
      
      return {
        ...prev,
        [questionId]: updatedResponse
      };
    });
  }, [setResponses]);

  // Handle media changes for a question
  const handleMediaChange = useCallback((questionId: string, mediaUrls: string[]) => {
    setResponses((prev) => {
      const currentResponse = prev[questionId] || {};
      
      return {
        ...prev,
        [questionId]: {
          ...currentResponse,
          mediaUrls
        }
      };
    });
  }, [setResponses]);

  // Upload media file for a question
  const handleMediaUpload = useCallback(async (questionId: string, file: File): Promise<string | null> => {
    if (!file || !inspectionId) return null;
    
    try {
      // Ensure the bucket exists
      const bucketName = "inspection-media";
      const bucketReady = await createBucketIfNeeded(bucketName);
      
      if (!bucketReady) {
        toast.error("Não foi possível acessar o armazenamento de mídia");
        return null;
      }
      
      // Generate a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${inspectionId}/${questionId}/${Date.now()}.${fileExt}`;
      
      // Upload the file
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
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      // Add the URL to the response
      const fileUrl = urlData.publicUrl;
      
      // Use setResponses to get the current state safely
      setResponses(currentResponses => {
        const currentMediaUrls = currentResponses[questionId]?.mediaUrls || [];
        return {
          ...currentResponses,
          [questionId]: {
            ...currentResponses[questionId],
            mediaUrls: [...currentMediaUrls, fileUrl]
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

  // Save all inspection responses to Supabase
  const handleSaveInspection = useCallback(async (currentResponses: Record<string, any>, inspection: any) => {
    if (!inspectionId) {
      toast.error("ID da inspeção não fornecido");
      return;
    }

    try {
      setSavingResponses(true);
      
      // First check if this inspection exists
      const { data: inspectionExists, error: checkError } = await supabase
        .from("inspections")
        .select("id")
        .eq("id", inspectionId)
        .single();
        
      if (checkError || !inspectionExists) {
        toast.error("Inspeção não encontrada");
        return;
      }
      
      // Format responses for saving
      const responsesToSave = Object.entries(currentResponses).map(([questionId, response]) => ({
        inspection_id: inspectionId,
        question_id: questionId,
        answer: response.value || null,
        notes: response.comment || null,
        action_plan: response.actionPlan || null,
        media_urls: response.mediaUrls || [],
        sub_checklist_responses: response.subChecklistResponses || {},
        updated_at: new Date().toISOString()
      }));
      
      // For each response, check if it already exists and update or insert accordingly
      const savePromises = responsesToSave.map(async (response) => {
        const { data: existing } = await supabase
          .from("inspection_responses")
          .select("id")
          .eq("inspection_id", inspectionId)
          .eq("question_id", response.question_id)
          .single();
          
        if (existing) {
          // Update existing response
          return supabase
            .from("inspection_responses")
            .update({
              answer: response.answer,
              notes: response.notes,
              action_plan: response.action_plan,
              media_urls: response.media_urls,
              sub_checklist_responses: response.sub_checklist_responses,
              updated_at: response.updated_at
            })
            .eq("inspection_id", inspectionId)
            .eq("question_id", response.question_id);
        } else {
          // Insert new response
          return supabase
            .from("inspection_responses")
            .insert(response);
        }
      });
      
      // Execute all promises
      await Promise.all(savePromises);
      
      // Update inspection status to "Em Andamento" if it's "Pendente"
      if (inspection.status === "Pendente") {
        await supabase
          .from("inspections")
          .update({ status: "Em Andamento", updated_at: new Date().toISOString() })
          .eq("id", inspectionId);
      }
      
      toast.success("Respostas salvas com sucesso");
    } catch (error: any) {
      console.error("Error saving inspection responses:", error);
      toast.error(`Erro ao salvar respostas: ${error.message || "Erro desconhecido"}`);
      throw error;
    } finally {
      setSavingResponses(false);
    }
  }, [inspectionId]);

  // Save sub-checklist responses
  const handleSaveSubChecklistResponses = useCallback(async (subChecklistId: string, subResponses: Record<string, any>) => {
    if (!inspectionId || !subChecklistId) {
      toast.error("ID da inspeção ou sub-checklist não fornecido");
      return;
    }
    
    try {
      setSavingResponses(true);
      
      // Get the parent question ID
      const { data: subChecklist, error: subChecklistError } = await supabase
        .from("checklists")
        .select("parent_question_id")
        .eq("id", subChecklistId)
        .single();
        
      if (subChecklistError ||
</lov-code>

I need to complete the implementation with more components and functionality. Let me continue:

<lov-code>
Let's refactor the `useResponseHandling.ts` file to avoid truncation and complete the DeleteInspectionDialog component:

<lov-write file_path="src/hooks/inspection/useResponseHandling.ts">
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

  // Handle changes to response values
  const handleResponseChange = useCallback((questionId: string, data: any) => {
    setResponses((prev) => {
      const currentResponse = prev[questionId] || {};
      
      return {
        ...prev,
        [questionId]: {
          ...currentResponse,
          ...data
        }
      };
    });
  }, [setResponses]);

  // Handle media changes for a question
  const handleMediaChange = useCallback((questionId: string, mediaUrls: string[]) => {
    setResponses((prev) => {
      const currentResponse = prev[questionId] || {};
      
      return {
        ...prev,
        [questionId]: {
          ...currentResponse,
          mediaUrls
        }
      };
    });
  }, [setResponses]);

  // Upload media file for a question
  const handleMediaUpload = useCallback(async (questionId: string, file: File): Promise<string | null> => {
    if (!file || !inspectionId) return null;
    
    try {
      // Ensure the bucket exists
      const bucketName = "inspection-media";
      const bucketReady = await createBucketIfNeeded(bucketName);
      
      if (!bucketReady) {
        toast.error("Não foi possível acessar o armazenamento de mídia");
        return null;
      }
      
      // Generate a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${inspectionId}/${questionId}/${Date.now()}.${fileExt}`;
      
      // Upload the file
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
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      // Add the URL to the response
      const fileUrl = urlData.publicUrl;
      
      // Use setResponses to get the current state safely
      setResponses(currentResponses => {
        const currentMediaUrls = currentResponses[questionId]?.mediaUrls || [];
        return {
          ...currentResponses,
          [questionId]: {
            ...currentResponses[questionId],
            mediaUrls: [...currentMediaUrls, fileUrl]
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

  // Save all inspection responses to Supabase
  const handleSaveInspection = useCallback(async (currentResponses: Record<string, any>, inspection: any) => {
    if (!inspectionId) {
      toast.error("ID da inspeção não fornecido");
      return;
    }

    try {
      setSavingResponses(true);
      
      // First check if this inspection exists
      const { data: inspectionExists, error: checkError } = await supabase
        .from("inspections")
        .select("id")
        .eq("id", inspectionId)
        .single();
        
      if (checkError || !inspectionExists) {
        toast.error("Inspeção não encontrada");
        return;
      }
      
      // Format responses for saving
      const responsesToSave = Object.entries(currentResponses).map(([questionId, response]) => ({
        inspection_id: inspectionId,
        question_id: questionId,
        answer: response.value || null,
        notes: response.comment || null,
        action_plan: response.actionPlan || null,
        media_urls: response.mediaUrls || [],
        sub_checklist_responses: response.subChecklistResponses || {},
        updated_at: new Date().toISOString()
      }));
      
      // For each response, check if it already exists and update or insert accordingly
      const savePromises = responsesToSave.map(async (response) => {
        const { data: existing } = await supabase
          .from("inspection_responses")
          .select("id")
          .eq("inspection_id", inspectionId)
          .eq("question_id", response.question_id)
          .single();
          
        if (existing) {
          // Update existing response
          return supabase
            .from("inspection_responses")
            .update({
              answer: response.answer,
              notes: response.notes,
              action_plan: response.action_plan,
              media_urls: response.media_urls,
              sub_checklist_responses: response.sub_checklist_responses,
              updated_at: response.updated_at
            })
            .eq("inspection_id", inspectionId)
            .eq("question_id", response.question_id);
        } else {
          // Insert new response
          return supabase
            .from("inspection_responses")
            .insert(response);
        }
      });
      
      // Execute all promises
      await Promise.all(savePromises);
      
      // Update inspection status to "Em Andamento" if it's "Pendente"
      if (inspection.status === "Pendente") {
        await supabase
          .from("inspections")
          .update({ status: "Em Andamento", updated_at: new Date().toISOString() })
          .eq("id", inspectionId);
      }
      
      toast.success("Respostas salvas com sucesso");
    } catch (error: any) {
      console.error("Error saving inspection responses:", error);
      toast.error(`Erro ao salvar respostas: ${error.message || "Erro desconhecido"}`);
      throw error;
    } finally {
      setSavingResponses(false);
    }
  }, [inspectionId]);

  // Save sub-checklist responses
  const handleSaveSubChecklistResponses = useCallback(async (subChecklistId: string, subResponses: Record<string, any>) => {
    if (!inspectionId || !subChecklistId) {
      toast.error("ID da inspeção ou sub-checklist não fornecido");
      return;
    }
    
    try {
      setSavingResponses(true);
      
      // Get the parent question ID
      const { data: subChecklist, error: subChecklistError } = await supabase
        .from("checklists")
        .select("parent_question_id")
        .eq("id", subChecklistId)
        .single();
        
      if (subChecklistError) {
        console.error("Error fetching sub-checklist:", subChecklistError);
        toast.error("Erro ao buscar informações do sub-checklist");
        return;
      }
      
      const parentQuestionId = subChecklist?.parent_question_id;
      
      if (!parentQuestionId) {
        toast.error("Pergunta pai não encontrada para este sub-checklist");
        return;
      }
      
      // Update the parent question's response with the sub-checklist responses
      setResponses((prev) => {
        const currentResponse = prev[parentQuestionId] || {};
        
        return {
          ...prev,
          [parentQuestionId]: {
            ...currentResponse,
            subChecklistResponses: {
              ...(currentResponse.subChecklistResponses || {}),
              [subChecklistId]: subResponses
            }
          }
        };
      });
      
      // Save the updated responses
      const { data: parentResponse } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId)
        .eq("question_id", parentQuestionId)
        .single();
      
      if (parentResponse) {
        // Update existing response
        await supabase
          .from("inspection_responses")
          .update({
            sub_checklist_responses: {
              ...(parentResponse.sub_checklist_responses || {}),
              [subChecklistId]: subResponses
            },
            updated_at: new Date().toISOString()
          })
          .eq("inspection_id", inspectionId)
          .eq("question_id", parentQuestionId);
      } else {
        // Create new response
        await supabase
          .from("inspection_responses")
          .insert({
            inspection_id: inspectionId,
            question_id: parentQuestionId,
            sub_checklist_responses: {
              [subChecklistId]: subResponses
            },
            updated_at: new Date().toISOString()
          });
      }
      
      toast.success("Respostas do sub-checklist salvas com sucesso");
    } catch (error: any) {
      console.error("Error saving sub-checklist responses:", error);
      toast.error(`Erro ao salvar respostas do sub-checklist: ${error.message}`);
    } finally {
      setSavingResponses(false);
    }
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
