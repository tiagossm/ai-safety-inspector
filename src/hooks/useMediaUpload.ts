
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { createBucketIfNeeded } from "@/utils/createBucketIfNeeded";

export interface UploadResult {
  path: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    try {
      console.log("📤 Iniciando upload de arquivo:", file.name, file.type);
      setIsUploading(true);
      setProgress(0);
      setError(null);
      
      // Garantir que o bucket existe
      const bucketName = "inspection-media";
      const bucketReady = await createBucketIfNeeded(bucketName);
      
      if (!bucketReady) {
        throw new Error("O bucket de armazenamento não está disponível. Contate o administrador.");
      }
      
      // Criar um nome de arquivo único
      const fileExt = file.name.split(".").pop() || '';
      const safeFileName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
      const fileName = `${uuidv4()}-${safeFileName}`;
      const filePath = `uploads/${fileName}`;
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      clearInterval(progressInterval);
      
      if (error) {
        console.error("Erro no upload:", error);
        setError(error);
        throw error;
      }
      
      console.log("✅ Arquivo enviado com sucesso:", filePath);
      setProgress(100);

      // Obter a URL pública
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log("📊 URL do arquivo gerada:", urlData.publicUrl);

      return {
        path: filePath,
        url: urlData.publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };
    } catch (error: any) {
      console.error("Erro ao enviar arquivo:", error);
      setError(error);
      toast.error("Erro ao enviar arquivo: " + (error instanceof Error ? error.message : "Erro desconhecido"));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMedia = async (mediaBlob: Blob, fileType: string, fileName?: string): Promise<UploadResult | null> => {
    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);
      
      const mediaType = fileType.split('/')[0]; // 'audio', 'video', ou 'image'
      const extension = fileType.split('/')[1]; // 'mp3', 'mp4', 'jpeg', etc.
      
      // Criar um arquivo a partir do blob
      const file = new File(
        [mediaBlob], 
        fileName || `${mediaType}_${Date.now()}.${extension}`, 
        { type: fileType }
      );
      
      console.log(`📤 Enviando arquivo ${mediaType}:`, file.name);
      
      return await uploadFile(file);
    } catch (error: any) {
      console.error(`Erro ao enviar ${fileType.split('/')[0]}:`, error);
      setError(error);
      toast.error(`Erro ao enviar mídia: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      throw error;
    }
  };
  
  const deleteFile = async (url: string): Promise<boolean> => {
    try {
      // Extrair o caminho da URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketName = pathParts[1]; // Geralmente "inspection-media"
      const filePath = pathParts.slice(2).join('/'); // O resto do caminho
      
      if (!bucketName || !filePath) {
        throw new Error("URL inválida para exclusão");
      }
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
        
      if (error) {
        console.error("Erro na exclusão:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      toast.error("Erro ao excluir arquivo");
      return false;
    }
  };

  return { 
    uploadFile, 
    uploadMedia, 
    deleteFile,
    isUploading, 
    progress, 
    error 
  };
}
