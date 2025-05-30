
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createBucketIfNeeded } from "@/utils/createBucketIfNeeded";

export function useMediaHandler(inspectionId: string | undefined, updateResponses: (questionId: string, updates: any) => void) {
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const handleMediaChange = useCallback((questionId: string, mediaUrls: string[]) => {
    console.log(`[useMediaHandler] handleMediaChange para questão ${questionId}:`, mediaUrls);
    
    updateResponses(questionId, {
      mediaUrls: [...mediaUrls],
      updatedAt: new Date().toISOString()
    });
  }, [updateResponses]);

  const handleMediaUpload = useCallback(async (questionId: string, file: File): Promise<string | null> => {
    if (!file || !inspectionId) return null;
    setUploadingMedia(true);

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

      // Atualizar a resposta com a nova URL de mídia
      updateResponses(questionId, {
        mediaUrls: prev => [...(prev || []), fileUrl],
        updatedAt: new Date().toISOString()
      });

      return fileUrl;
    } catch (error: any) {
      console.error("Error in media upload:", error);
      toast.error(`Erro ao enviar mídia: ${error.message}`);
      return null;
    } finally {
      setUploadingMedia(false);
    }
  }, [inspectionId, updateResponses]);

  return {
    handleMediaChange,
    handleMediaUpload,
    uploadingMedia
  };
}
