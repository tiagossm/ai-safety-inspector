
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { File, FileVideo, Mic, Camera, Plus, Upload } from "lucide-react";
import { MediaAttachments } from "./MediaAttachments";
import { MediaUploadService } from "@/services/inspection/mediaUploadService";
import { toast } from "sonner";

interface PhotoInputProps {
  mediaUrls?: string[];
  onAddMedia?: (newUrl: string) => void;
  onDeleteMedia?: (urlToDelete: string) => void;
  onMediaChange?: (urls: string[]) => void;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  inspectionId?: string;
  questionId?: string;
  disabled?: boolean;
}

export function PhotoInput({
  mediaUrls = [],
  onAddMedia,
  onDeleteMedia,
  onMediaChange,
  allowsPhoto = true,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  inspectionId,
  questionId,
  disabled = false
}: PhotoInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (acceptedTypes: string) => {
    if (!inspectionId || !questionId) {
      toast.error("Dados da inspeção não disponíveis");
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptedTypes;
      fileInputRef.current.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;

        const file = files[0];
        console.log("[PhotoInput] File selected:", file.name, file.type);

        try {
          toast.info("Enviando arquivo...");
          
          const uploadedUrl = await MediaUploadService.uploadFile(
            file, 
            inspectionId, 
            questionId
          );

          if (uploadedUrl) {
            const newUrls = [...mediaUrls, uploadedUrl];
            
            // Chamar os callbacks apropriados
            if (onAddMedia) {
              onAddMedia(uploadedUrl);
            }
            
            if (onMediaChange) {
              onMediaChange(newUrls);
            }
            
            toast.success("Arquivo enviado com sucesso!");
          }
        } catch (error: any) {
          console.error("[PhotoInput] Upload error:", error);
          toast.error(`Erro no upload: ${error.message}`);
        }

        // Limpar o input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      
      fileInputRef.current.click();
    }
  };

  const handleDeleteMedia = async (url: string) => {
    try {
      const success = await MediaUploadService.deleteFile(url);
      
      if (success) {
        const newUrls = mediaUrls.filter(mediaUrl => mediaUrl !== url);
        
        if (onDeleteMedia) {
          onDeleteMedia(url);
        }
        
        if (onMediaChange) {
          onMediaChange(newUrls);
        }
        
        toast.success("Arquivo removido com sucesso!");
      } else {
        toast.error("Erro ao remover arquivo");
      }
    } catch (error: any) {
      console.error("[PhotoInput] Delete error:", error);
      toast.error(`Erro ao remover arquivo: ${error.message}`);
    }
  };

  const handleOpenPreview = (url: string) => {
    window.open(url, '_blank');
  };
  
  const handleOpenAnalysis = (url: string, questionContext?: string) => {
    console.log("PhotoInput: Opening analysis for URL:", url);
    console.log("PhotoInput: Question context:", questionContext);
    // Implementar análise futuramente
    toast.info("Análise de mídia em desenvolvimento");
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={() => {}} // Handled in handleFileSelect
      />
      
      <div className="flex flex-wrap gap-2">
        {allowsPhoto && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={() => handleFileSelect("image/*")}
            disabled={disabled}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Foto</span>
          </Button>
        )}
        
        {allowsVideo && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={() => handleFileSelect("video/*")}
            disabled={disabled}
          >
            <FileVideo className="h-3.5 w-3.5" />
            <span>Vídeo</span>
          </Button>
        )}
        
        {allowsAudio && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={() => handleFileSelect("audio/*")}
            disabled={disabled}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Áudio</span>
          </Button>
        )}
        
        {allowsFiles && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={() => handleFileSelect("*/*")}
            disabled={disabled}
          >
            <File className="h-3.5 w-3.5" />
            <span>Arquivo</span>
          </Button>
        )}
        
        {!allowsPhoto && !allowsVideo && !allowsAudio && !allowsFiles && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={() => handleFileSelect("*/*")}
            disabled={disabled}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Anexar</span>
          </Button>
        )}
      </div>
      
      <MediaAttachments 
        mediaUrls={mediaUrls} 
        onDelete={handleDeleteMedia} 
        onOpenPreview={handleOpenPreview}
        onOpenAnalysis={handleOpenAnalysis}
        readOnly={disabled}
      />
    </div>
  );
}
