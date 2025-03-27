
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, File, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaUploaded: (mediaData: any) => void;
  response: any;
  allowedTypes?: string[];
}

export function MediaDialog({
  open,
  onOpenChange,
  onMediaUploaded,
  response,
  allowedTypes = ["image/*", "video/*", "audio/*", "application/pdf"]
}: MediaDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. O tamanho máximo é 10MB.");
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast.error("Selecione um arquivo para upload");
      return;
    }
    
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `inspection_media/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      if (!urlData.publicUrl) throw new Error("Falha ao obter URL pública do arquivo");
      
      onMediaUploaded({
        url: urlData.publicUrl,
        type: file.type,
        name: file.name,
        size: file.size
      });
      
      // Reset state
      setFile(null);
      setPreview(null);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setUploading(false);
    }
  };
  
  const acceptAttribute = allowedTypes.join(", ");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="media-dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span>Adicionar Mídia</span>
          </DialogTitle>
          <DialogDescription id="media-dialog-description">
            Adicione fotos, vídeos ou outros arquivos à sua resposta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="media-file">Selecione um arquivo</Label>
            <Input
              id="media-file"
              type="file"
              accept={acceptAttribute}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          
          {preview && (
            <div className="mt-2 rounded-md overflow-hidden border">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-auto max-h-[200px] object-contain" 
              />
            </div>
          )}
          
          {file && !preview && (
            <div className="mt-2 p-4 border rounded-md flex items-center gap-2">
              <File className="h-8 w-8 text-muted-foreground" />
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB • {file.type}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                <span>Enviar</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
