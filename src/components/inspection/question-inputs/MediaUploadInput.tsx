
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, Mic, File, Upload, X, ImageIcon } from "lucide-react";
import { MediaAttachments } from "./MediaAttachments";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaCaptureButton } from "@/components/media/MediaCaptureButton";
import { FileUploadButton } from "@/components/media/FileUploadButton";

interface MediaUploadInputProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  onMediaUpload?: (file: File) => Promise<string | null>;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  readOnly?: boolean;
}

export function MediaUploadInput({
  mediaUrls = [],
  onMediaChange,
  onMediaUpload,
  allowsPhoto = false,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  readOnly = false
}: MediaUploadInputProps) {
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadFile, isUploading } = useMediaUpload();
  
  const handleMediaUploaded = (mediaData: any) => {
    if (mediaData && mediaData.url) {
      onMediaChange([...mediaUrls, mediaData.url]);
      toast.success("Mídia adicionada com sucesso!");
    }
  };
  
  const handleDeleteMedia = (urlToDelete: string) => {
    if (readOnly) return;
    const updatedUrls = mediaUrls.filter(url => url !== urlToDelete);
    onMediaChange(updatedUrls);
    toast.success("Anexo removido.");
  };
  
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly || isUploading) return;
    setDragOver(false);
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    
    const file = e.dataTransfer.files[0];
    
    // Validate file type based on allowed media types
    const isPhotoValid = allowsPhoto && file.type.startsWith('image/');
    const isVideoValid = allowsVideo && file.type.startsWith('video/');
    const isAudioValid = allowsAudio && file.type.startsWith('audio/');
    const isFileValid = allowsFiles;
    
    if (!isPhotoValid && !isVideoValid && !isAudioValid && !isFileValid) {
      toast.error("Tipo de arquivo não permitido.");
      return;
    }
    
    try {
      setUploadProgress(0);
      let result;
      
      if (onMediaUpload) {
        const url = await onMediaUpload(file);
        if (url) {
          onMediaChange([...mediaUrls, url]);
          toast.success("Arquivo enviado com sucesso!");
        }
      } else {
        // Use a simulated progress interval
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 5, 95));
        }, 100);
        
        result = await uploadFile(file);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (result?.url) {
          onMediaChange([...mediaUrls, result.url]);
          toast.success("Arquivo enviado com sucesso!");
          
          // Reset progress after a delay
          setTimeout(() => setUploadProgress(0), 1000);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao enviar arquivo.");
      setUploadProgress(0);
    }
  }, [mediaUrls, onMediaChange, onMediaUpload, uploadFile, allowsPhoto, allowsVideo, allowsAudio, allowsFiles, readOnly, isUploading]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly && !isUploading) {
      setDragOver(true);
    }
  }, [readOnly, isUploading]);
  
  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);
  
  // If in readOnly mode, just show the attachments without upload functionality
  if (readOnly && mediaUrls.length > 0) {
    return <MediaAttachments mediaUrls={mediaUrls} readOnly={true} />;
  } else if (readOnly) {
    return null; // Don't show anything if readOnly and no attachments
  }
  
  return (
    <div className="space-y-4">
      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-md p-4 transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
        } ${readOnly || isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            Arraste arquivos aqui ou selecione uma opção abaixo
          </p>
          
          {/* Media Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {allowsPhoto && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCameraDialog(true)}
                disabled={readOnly || isUploading}
                className="flex items-center"
              >
                <Camera className="h-4 w-4 mr-2" />
                <span>Foto</span>
              </Button>
            )}
            
            {allowsVideo && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVideoDialog(true)}
                disabled={readOnly || isUploading}
                className="flex items-center"
              >
                <Video className="h-4 w-4 mr-2" />
                <span>Vídeo</span>
              </Button>
            )}
            
            {allowsAudio && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAudioDialog(true)}
                disabled={readOnly || isUploading}
                className="flex items-center"
              >
                <Mic className="h-4 w-4 mr-2" />
                <span>Áudio</span>
              </Button>
            )}
            
            {allowsFiles && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFileDialog(true)}
                disabled={readOnly || isUploading}
                className="flex items-center"
              >
                <File className="h-4 w-4 mr-2" />
                <span>Arquivo</span>
              </Button>
            )}
          </div>
        </div>
        
        {uploadProgress > 0 && (
          <div className="mt-3">
            <Progress value={uploadProgress} className="h-1" />
            <p className="text-xs text-center text-muted-foreground mt-1">
              Enviando... {uploadProgress}%
            </p>
          </div>
        )}
      </div>
      
      {/* Display uploaded media */}
      {mediaUrls.length > 0 && (
        <MediaAttachments 
          mediaUrls={mediaUrls} 
          onDelete={readOnly ? undefined : handleDeleteMedia}
          readOnly={readOnly}
        />
      )}
      
      {/* Camera Dialog for taking photos */}
      {allowsPhoto && (
        <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tirar Foto</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center">
              <MediaCaptureButton 
                type="photo"
                onMediaCaptured={(data) => {
                  handleMediaUploaded(data);
                  setShowCameraDialog(false);
                }}
                className="w-full"
                variant="default"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Video Dialog for recording videos */}
      {allowsVideo && (
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gravar Vídeo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center">
              <MediaCaptureButton 
                type="video"
                onMediaCaptured={(data) => {
                  handleMediaUploaded(data);
                  setShowVideoDialog(false);
                }}
                className="w-full"
                variant="default"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Audio Dialog for recording audio */}
      {allowsAudio && (
        <Dialog open={showAudioDialog} onOpenChange={setShowAudioDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gravar Áudio</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center">
              <MediaCaptureButton 
                type="audio"
                onMediaCaptured={(data) => {
                  handleMediaUploaded(data);
                  setShowAudioDialog(false);
                }}
                className="w-full"
                variant="default"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* File Upload Dialog */}
      {allowsFiles && (
        <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enviar Arquivo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center">
              <FileUploadButton 
                onFileUploaded={(data) => {
                  handleMediaUploaded(data);
                  setShowFileDialog(false);
                }}
                buttonText="Selecionar arquivo"
                className="w-full"
                variant="default"
                accept="*/*"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
