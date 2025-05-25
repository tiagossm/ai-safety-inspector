
import { useState, useCallback } from "react";
import { MediaUploadService } from "@/services/inspection/mediaUploadService";
import { toast } from "sonner";

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
    if (!file || !inspectionId) {
      toast.error("Dados insuficientes para upload");
      return null;
    }
    
    setUploadingMedia(true);

    try {
      console.log(`[useMediaHandler] Uploading file for question ${questionId}:`, file.name);
      
      const fileUrl = await MediaUploadService.uploadFile(file, inspectionId, questionId);

      if (fileUrl) {
        // Atualizar a resposta com a nova URL de mídia
        updateResponses(questionId, (prev: any) => ({
          ...prev,
          mediaUrls: [...(prev?.mediaUrls || []), fileUrl],
          updatedAt: new Date().toISOString()
        }));
        
        toast.success("Arquivo enviado com sucesso!");
      }

      return fileUrl;
    } catch (error: any) {
      console.error("[useMediaHandler] Error in media upload:", error);
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
