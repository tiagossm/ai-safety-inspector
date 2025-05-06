
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
      console.log("📤 Starting file upload:", file.name, file.type);
      setIsUploading(true);
      setProgress(0);
      setError(null);
      
      // Ensure the bucket exists
      const bucketName = "inspection-media";
      const bucketReady = await createBucketIfNeeded(bucketName);
      
      if (!bucketReady) {
        throw new Error("Não foi possível criar ou acessar o bucket de armazenamento");
      }
      
      // Create a unique filename
      const fileExt = file.name.split(".").pop() || '';
      const safeFileName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
      const fileName = `${uuidv4()}-${safeFileName}`;
      const filePath = `uploads/${fileName}`;
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      clearInterval(progressInterval);
      
      if (error) {
        console.error("Upload error:", error);
        setError(error);
        throw error;
      }
      
      console.log("✅ File uploaded successfully:", filePath);
      setProgress(100);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log("📊 File URL generated:", urlData.publicUrl);

      return {
        path: filePath,
        url: urlData.publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };
    } catch (error: any) {
      console.error("Error uploading file:", error);
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
      
      const mediaType = fileType.split('/')[0]; // 'audio', 'video', or 'image'
      const extension = fileType.split('/')[1]; // 'mp3', 'mp4', 'jpeg', etc.
      
      // Create a file from the blob
      const file = new File(
        [mediaBlob], 
        fileName || `${mediaType}_${Date.now()}.${extension}`, 
        { type: fileType }
      );
      
      console.log(`📤 Uploading ${mediaType} file:`, file.name);
      
      return await uploadFile(file);
    } catch (error: any) {
      console.error(`Error uploading ${fileType.split('/')[0]}:`, error);
      setError(error);
      toast.error(`Erro ao enviar mídia: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      throw error;
    }
  };
  
  const deleteFile = async (url: string): Promise<boolean> => {
    try {
      // Extract the path from the URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketName = pathParts[1]; // Usually "inspection-media"
      const filePath = pathParts.slice(2).join('/'); // The rest of the path
      
      if (!bucketName || !filePath) {
        throw new Error("URL inválida para exclusão");
      }
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
        
      if (error) {
        console.error("Delete error:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
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
