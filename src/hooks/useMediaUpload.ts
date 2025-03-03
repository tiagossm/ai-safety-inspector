
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useMediaUpload(bucketName = "checklist-media") {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadMedia = async (file: File, path: string): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      // Gera um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;
      
      // Faz o upload do arquivo
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            setProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        });

      if (error) throw error;
      
      // Gera URL pública para o arquivo
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Falha ao carregar o arquivo. Tente novamente.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      toast.error('Falha ao remover o arquivo.');
      return false;
    }
  };

  return {
    uploadMedia,
    removeMedia,
    isUploading,
    progress
  };
}
