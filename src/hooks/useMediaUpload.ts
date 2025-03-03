
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setProgress(0);
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      
      // Upload option with manual progress tracking
      const { data, error } = await supabase.storage
        .from("checklist-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      // Simulate progress since onUploadProgress is not available
      setProgress(100);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("checklist-media")
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, progress };
}
