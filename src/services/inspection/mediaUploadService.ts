
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class MediaUploadService {
  private static readonly BUCKET_NAME = "inspection-media";
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  static async ensureBucketExists(): Promise<boolean> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          fileSizeLimit: this.MAX_FILE_SIZE
        });
        
        if (error) {
          console.error("Error creating bucket:", error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      return false;
    }
  }

  static async uploadFile(
    file: File, 
    inspectionId: string, 
    questionId: string
  ): Promise<string | null> {
    try {
      // Verificar tamanho do arquivo
      if (file.size > this.MAX_FILE_SIZE) {
        toast.error("Arquivo muito grande. Máximo permitido: 50MB");
        return null;
      }

      // Garantir que o bucket existe
      const bucketReady = await this.ensureBucketExists();
      if (!bucketReady) {
        toast.error("Erro ao acessar storage");
        return null;
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${inspectionId}/${questionId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log("[MediaUploadService] Uploading file:", fileName);

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        console.error("[MediaUploadService] Upload error:", error);
        toast.error(`Erro no upload: ${error.message}`);
        return null;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log("[MediaUploadService] File uploaded successfully:", publicUrl);
      
      return publicUrl;
    } catch (error: any) {
      console.error("[MediaUploadService] Unexpected error:", error);
      toast.error(`Erro inesperado no upload: ${error.message}`);
      return null;
    }
  }

  static async deleteFile(url: string): Promise<boolean> {
    try {
      // Extrair o path do arquivo da URL
      const urlParts = url.split(`/${this.BUCKET_NAME}/`);
      if (urlParts.length < 2) {
        console.error("[MediaUploadService] Invalid URL format:", url);
        return false;
      }

      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error("[MediaUploadService] Delete error:", error);
        return false;
      }

      console.log("[MediaUploadService] File deleted successfully:", filePath);
      return true;
    } catch (error: any) {
      console.error("[MediaUploadService] Unexpected error deleting file:", error);
      return false;
    }
  }
}
