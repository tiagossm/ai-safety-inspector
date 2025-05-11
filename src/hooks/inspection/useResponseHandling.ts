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

  const handleResponseChange = useCallback((questionId: string, value: any, additionalData?: any) => {
    setResponses((prev) => {
      const currentResponse = prev[questionId] || {};

      let updatedResponse;

      if (typeof additionalData === 'object') {
        updatedResponse = {
          ...currentResponse,
          ...(typeof value === 'object' && value !== null ? value : { value }),
          ...additionalData
        };
      } else {
        updatedResponse = {
          ...currentResponse,
          ...(typeof value === 'object' && value !== null ? value : { value })
        };
      }

      return {
        ...prev,
        [questionId]: updatedResponse
      };
    });
  }, [setResponses]);

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

  const handleSaveInspection = useCallback(async (currentResponses: Record<string, any>, inspection: any) => {
    return;
  }, [inspectionId]);

  const handleSaveSubChecklistResponses = useCallback(async (subChecklistId: string, subResponses: Record<string, any>) => {
    return;
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