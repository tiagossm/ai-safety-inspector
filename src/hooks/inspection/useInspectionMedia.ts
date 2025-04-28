
import { useState, useCallback } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { toast } from "sonner";

export interface MediaHandlerProps {
  inspectionId?: string;
  onSuccess?: (mediaUrl: string) => void;
}

export function useInspectionMedia({ inspectionId, onSuccess }: MediaHandlerProps = {}) {
  const [mediaUrls, setMediaUrls] = useState<Record<string, string[]>>({});
  const { uploadFile, uploadMedia, isUploading, progress } = useMediaUpload();

  const handleMediaUpload = useCallback(async (questionId: string, file: File): Promise<string | null> => {
    if (!file) return null;
    
    try {
      const result = await uploadFile(file);
      
      if (result?.url) {
        // Update the media URLs for this question
        setMediaUrls((prev) => {
          const currentUrls = prev[questionId] || [];
          return {
            ...prev,
            [questionId]: [...currentUrls, result.url]
          };
        });
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.url);
        }

        toast.success("Mídia enviada com sucesso!");
        return result.url;
      }
      
      return null;
    } catch (error: any) {
      console.error("Error uploading media:", error);
      toast.error(`Erro ao enviar mídia: ${error.message || "Erro desconhecido"}`);
      return null;
    }
  }, [uploadFile, onSuccess]);

  const handleMediaChange = useCallback((questionId: string, updatedUrls: string[]) => {
    setMediaUrls((prev) => ({
      ...prev,
      [questionId]: updatedUrls
    }));
  }, []);

  const deleteMedia = useCallback((questionId: string, urlToDelete: string) => {
    setMediaUrls((prev) => {
      const currentUrls = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: currentUrls.filter(url => url !== urlToDelete)
      };
    });
  }, []);

  return {
    mediaUrls,
    setMediaUrls,
    handleMediaUpload,
    handleMediaChange,
    deleteMedia,
    isUploading,
    uploadProgress: progress
  };
}
