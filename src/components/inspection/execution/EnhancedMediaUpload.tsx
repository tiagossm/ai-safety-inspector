
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileImage,
  FileVideo,
  FileAudio,
  File,
  X,
  Upload,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface EnhancedMediaUploadProps {
  mediaUrls: string[];
  onMediaChange: (mediaUrls: string[]) => void;
  onMediaUpload?: (file: File) => Promise<string | null>;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  disabled?: boolean;
}

export function EnhancedMediaUpload({
  mediaUrls,
  onMediaChange,
  onMediaUpload,
  allowsPhoto = true,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  disabled = false
}: EnhancedMediaUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo é muito grande. O tamanho máximo é 10MB.");
      return;
    }

    // Check file type based on props
    const fileType = file.type.split('/')[0];
    if (
      (fileType === 'image' && !allowsPhoto) ||
      (fileType === 'video' && !allowsVideo) ||
      (fileType === 'audio' && !allowsAudio) ||
      (!['image', 'video', 'audio'].includes(fileType) && !allowsFiles)
    ) {
      toast.error(`Tipo de arquivo não permitido: ${fileType}`);
      return;
    }

    try {
      setIsUploading(true);

      let uploadedUrl: string | null = null;

      if (onMediaUpload) {
        uploadedUrl = await onMediaUpload(file);
      } else {
        // Fallback to create local URL for preview (this should be replaced with proper upload in production)
        uploadedUrl = URL.createObjectURL(file);
      }

      if (uploadedUrl) {
        onMediaChange([...mediaUrls, uploadedUrl]);
        toast.success("Mídia enviada com sucesso");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao enviar arquivo. Tente novamente.");
    } finally {
      setIsUploading(false);
      // Reset the input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  // Handle removal of media
  const handleRemoveMedia = (urlToRemove: string) => {
    const updatedUrls = mediaUrls.filter(url => url !== urlToRemove);
    onMediaChange(updatedUrls);
    
    // If the removed URL is being previewed, close the preview
    if (previewUrl === urlToRemove) {
      setPreviewUrl(null);
    }
  };

  // Handle opening the preview
  const handleOpenPreview = (url: string) => {
    setPreviewUrl(url);
  };

  // Get media type from URL
  const getMediaType = (url: string): string => {
    const fileExtension = url.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return 'image';
    } else if (['mp4', 'webm', 'mov'].includes(fileExtension)) {
      return 'video';
    } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
      return 'audio';
    } else {
      return 'file';
    }
  };

  // Get icon based on media type
  const getIcon = (url: string) => {
    const type = getMediaType(url);
    
    switch (type) {
      case 'image':
        return <FileImage className="h-4 w-4" />;
      case 'video':
        return <FileVideo className="h-4 w-4" />;
      case 'audio':
        return <FileAudio className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };
  
  // Function to render media in preview dialog
  const renderMediaPreview = (url: string) => {
    const type = getMediaType(url);
    
    switch (type) {
      case 'image':
        return <img src={url} alt="Preview" className="max-w-full max-h-[70vh] mx-auto rounded" />;
      case 'video':
        return (
          <video controls className="max-w-full max-h-[70vh] mx-auto">
            <source src={url} />
            Your browser does not support video playback.
          </video>
        );
      case 'audio':
        return (
          <audio controls className="w-full">
            <source src={url} />
            Your browser does not support audio playback.
          </audio>
        );
      default:
        return <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Abrir arquivo</a>;
    }
  };

  // Function to simulate AI analysis
  const handleAnalyzeMedia = async () => {
    if (mediaUrls.length === 0) {
      toast.error("Nenhuma mídia para analisar");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Análise de mídia concluída");
      // In a real implementation, we would return AI analysis results here
      
    } catch (error) {
      console.error("Error analyzing media:", error);
      toast.error("Erro na análise de mídia");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Media thumbnails */}
      {mediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {mediaUrls.map((url, index) => (
            <div 
              key={index}
              className="relative bg-muted rounded p-1 flex items-center group"
            >
              {getIcon(url)}
              
              <span className="text-xs ml-1 max-w-28 truncate">
                {url.split('/').pop()}
              </span>
              
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/30 rounded flex items-center justify-center gap-1 transition-opacity">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
                  onClick={() => handleOpenPreview(url)}
                >
                  <span className="sr-only">Preview</span>
                  <FileImage className="h-3 w-3" />
                </Button>
                
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full bg-black/30 text-white hover:bg-destructive hover:text-white"
                  onClick={() => handleRemoveMedia(url)}
                  disabled={disabled}
                >
                  <span className="sr-only">Remove</span>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload buttons */}
      <div className="flex flex-wrap gap-2">
        {allowsPhoto && (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
              disabled={isUploading || disabled}
            />
            <Button 
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none"
              disabled={isUploading || disabled}
            >
              {isUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileImage className="h-4 w-4 mr-1" />}
              Foto
            </Button>
          </div>
        )}
        
        {allowsVideo && (
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
              disabled={isUploading || disabled}
            />
            <Button 
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none"
              disabled={isUploading || disabled}
            >
              {isUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileVideo className="h-4 w-4 mr-1" />}
              Vídeo
            </Button>
          </div>
        )}
        
        {allowsAudio && (
          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
              disabled={isUploading || disabled}
            />
            <Button 
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none"
              disabled={isUploading || disabled}
            >
              {isUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileAudio className="h-4 w-4 mr-1" />}
              Áudio
            </Button>
          </div>
        )}
        
        {allowsFiles && (
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
              disabled={isUploading || disabled}
            />
            <Button 
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none"
              disabled={isUploading || disabled}
            >
              {isUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
              Arquivo
            </Button>
          </div>
        )}
        
        {mediaUrls.length > 0 && (
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAnalyzeMedia}
            disabled={isAnalyzing || disabled}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
            {isAnalyzing ? "Analisando..." : "Analisar com IA"}
          </Button>
        )}
      </div>
      
      {/* Preview dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Visualização de Mídia</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {previewUrl && renderMediaPreview(previewUrl)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
